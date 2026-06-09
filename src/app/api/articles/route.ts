import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { confirmUpload, confirmRichText } from '@/lib/s3';

// GET /api/articles?page=1&limit=20&search=&published=
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const search = searchParams.get('search') || '';
  const published = searchParams.get('published');
  const offset = (page - 1) * limit;

  const conditions: string[] = [];
  const values: any[] = [];
  let idx = 1;

  if (search) {
    conditions.push(`a.title ILIKE $${idx++}`);
    values.push(`%${search}%`);
  }
  if (published !== null && published !== '') {
    conditions.push(`a.published = $${idx++}`);
    values.push(published === 'true');
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const rows = await sql.query(
    `SELECT a.id, a.title, a.slug, a.published, a.featured, a.cover_image, a.created_at,
            c.name as category_name
     FROM articles a
     LEFT JOIN categories c ON a.category_id = c.id
     ${where}
     ORDER BY a.created_at DESC
     LIMIT ${limit} OFFSET ${offset}`,
    values
  );

  const [{ count }] = await sql.query(
    `SELECT COUNT(*) FROM articles a ${where}`,
    values
  ) as any[];

  return NextResponse.json({
    data: rows,
    count: parseInt(count),
    currentPage: page,
  });
}

// POST /api/articles
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, slug, content, published = false, featured = false, category_id, cover_image } = body;

    if (!title || !slug || !content) {
      return NextResponse.json({ message: 'title, slug, and content are required' }, { status: 400 });
    }

    // Move uploaded cover image and inline content images from temp directory to permanent paths
    const finalCoverImage = cover_image ? await confirmUpload(cover_image) : null;
    const finalContent = await confirmRichText(content);

    const [article] = await sql.query(
      `INSERT INTO articles (title, slug, content, published, featured, category_id, cover_image)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [title, slug, finalContent, published, featured, category_id || null, finalCoverImage]
    );

    return NextResponse.json(article, { status: 201 });
  } catch (err: any) {
    console.error('Failed to create article:', err);
    return NextResponse.json({ message: err.message || 'Server error' }, { status: 500 });
  }
}
