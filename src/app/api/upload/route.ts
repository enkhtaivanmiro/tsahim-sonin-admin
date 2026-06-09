import { NextRequest, NextResponse } from 'next/server';
import { uploadRichText } from '@/lib/s3';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    
    if (!file) {
      return NextResponse.json({ message: 'Файл олдсонгүй.' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await uploadRichText(buffer, file.type);
    
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Upload API Error:', error);
    return NextResponse.json(
      { message: error.message || 'Зураг хуулахад алдаа гарлаа.' },
      { status: 500 }
    );
  }
}
