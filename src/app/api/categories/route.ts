import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function GET() {
  const rows = await sql.query(`SELECT * FROM categories ORDER BY name ASC`);
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const { name, slug } = await req.json();
  if (!name || !slug) return NextResponse.json({ message: 'name and slug required' }, { status: 400 });
  const [cat] = await sql.query(
    `INSERT INTO categories (name, slug) VALUES ($1, $2) RETURNING *`,
    [name, slug]
  );
  return NextResponse.json(cat, { status: 201 });
}
