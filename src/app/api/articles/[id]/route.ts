import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { confirmUpload, confirmRichText, deleteFromS3, extractUrlsFromHtml } from '@/lib/s3';

// GET /api/articles/[id]
export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [article] = await sql.query(
    `SELECT a.*, c.name as category_name
     FROM articles a
     LEFT JOIN categories c ON a.category_id = c.id
     WHERE a.id = $1`,
    [id]
  );
  if (!article) return NextResponse.json({ message: 'Not found' }, { status: 404 });
  return NextResponse.json(article);
}

// PUT /api/articles/[id]
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { title, slug, content, published, featured = false, category_id, cover_image } = body;

    // Fetch the existing article to get previous content and cover image URLs for comparison/cleanup
    const [oldArticle] = await sql.query(
      `SELECT content, cover_image FROM articles WHERE id=$1`,
      [id]
    ) as any[];

    if (!oldArticle) return NextResponse.json({ message: 'Not found' }, { status: 404 });

    // Move uploaded cover image and inline content images from temp directory to permanent paths
    const finalCoverImage = await confirmUpload(cover_image, oldArticle.cover_image);
    const finalContent = await confirmRichText(content, oldArticle.content);

    const [article] = await sql.query(
      `UPDATE articles
       SET title=$1, slug=$2, content=$3, published=$4, featured=$5, category_id=$6, cover_image=$7, updated_at=NOW()
       WHERE id=$8 RETURNING *`,
      [title, slug, finalContent, published, featured, category_id || null, finalCoverImage || null, id]
    );

    return NextResponse.json(article);
  } catch (err: any) {
    console.error('Failed to update article:', err);
    return NextResponse.json({ message: err.message || 'Server error' }, { status: 500 });
  }
}

// DELETE /api/articles/[id]
export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // Fetch article data first to perform S3 asset cleanup before deletion
    const [article] = await sql.query(
      `SELECT content, cover_image FROM articles WHERE id=$1`,
      [id]
    ) as any[];

    if (article) {
      // Clean up cover image
      if (article.cover_image) {
        await deleteFromS3(article.cover_image);
      }
      
      // Clean up all rich-text inline images
      if (article.content) {
        const inlineUrls = extractUrlsFromHtml(article.content);
        await Promise.all(inlineUrls.map(url => deleteFromS3(url)));
      }
    }

    await sql.query(`DELETE FROM articles WHERE id=$1`, [id]);
    return NextResponse.json({ message: 'Deleted' });
  } catch (err: any) {
    console.error('Failed to delete article:', err);
    return NextResponse.json({ message: err.message || 'Server error' }, { status: 500 });
  }
}

// PATCH /api/articles/[id] — toggle published or featured
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action') || 'publish';

  let article;
  if (action === 'featured') {
    [article] = await sql.query(
      `UPDATE articles SET featured = NOT featured, updated_at=NOW() WHERE id=$1 RETURNING *`,
      [id]
    );
  } else {
    [article] = await sql.query(
      `UPDATE articles SET published = NOT published, updated_at=NOW() WHERE id=$1 RETURNING *`,
      [id]
    );
  }

  if (!article) return NextResponse.json({ message: 'Not found' }, { status: 404 });
  return NextResponse.json(article);
}
