import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function GET() {
  const [{ count: articlesCount }] = await sql.query(`SELECT COUNT(*)::int as count FROM articles`) as any[];
  const [{ count: publishedCount }] = await sql.query(`SELECT COUNT(*)::int as count FROM articles WHERE published = true`) as any[];
  const [{ count: draftCount }] = await sql.query(`SELECT COUNT(*)::int as count FROM articles WHERE published = false`) as any[];
  const [{ count: categoriesCount }] = await sql.query(`SELECT COUNT(*)::int as count FROM categories`) as any[];

  return NextResponse.json({
    articles: articlesCount,
    published: publishedCount,
    draft: draftCount,
    categories: categoriesCount,
  });
}
