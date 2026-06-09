import { S3Client, PutObjectCommand, DeleteObjectCommand, CopyObjectCommand } from '@aws-sdk/client-s3';
import sharp from 'sharp';
import { randomUUID } from 'crypto';

const BUCKET = process.env.S3_BUCKET || 'sonin';
const REGION = process.env.S3_REGION || 'us-east-1';
const CDN_DOMAIN = process.env.CDN_DOMAIN || 'd1vufv6540zu4t.cloudfront.net';

const s3Client = new S3Client({
  region: REGION,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
  },
});

export function extractKey(url: string): string {
  if (!url) return '';
  if (!url.startsWith('http')) return url;
  try {
    const pathname = new URL(url).pathname.substring(1);
    return pathname.startsWith(`${BUCKET}/`)
      ? pathname.substring(BUCKET.length + 1)
      : pathname;
  } catch (e) {
    return url;
  }
}

export async function uploadToS3(key: string, body: Buffer, contentType: string) {
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: body,
    ContentType: contentType,
    CacheControl: 'public, max-age=31536000, immutable',
  });
  await s3Client.send(command);
}

export async function deleteFromS3(url: string) {
  if (!url) return;
  const key = extractKey(url);
  if (!key) return;
  try {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET,
      Key: key,
    });
    await s3Client.send(command);
  } catch (err: any) {
    console.error(`Failed to delete S3 object "${key}":`, err.message);
  }
}

export async function moveObject(sourceKey: string, destKey: string) {
  try {
    const copyCommand = new CopyObjectCommand({
      Bucket: BUCKET,
      CopySource: `${BUCKET}/${encodeURIComponent(sourceKey)}`,
      Key: destKey,
    });
    await s3Client.send(copyCommand);

    const deleteCommand = new DeleteObjectCommand({
      Bucket: BUCKET,
      Key: sourceKey,
    });
    await s3Client.send(deleteCommand);
  } catch (err: any) {
    console.error(`Failed to move S3 object "${sourceKey}" -> "${destKey}":`, err.message);
    throw err;
  }
}

export async function uploadRichText(fileBuffer: Buffer, mimetype: string): Promise<{ url: string; imgUrl: string }> {
  const key = `tmp/rt-${randomUUID()}.webp`;
  
  // Resize and convert image to WebP format using sharp
  const body = await sharp(fileBuffer)
    .resize({ width: 1248, withoutEnlargement: true })
    .webp({ quality: 80 })
    .toBuffer();

  await uploadToS3(key, body, 'image/webp');
  return {
    url: `https://${CDN_DOMAIN}/${key}`,
    imgUrl: key,
  };
}

export async function confirmUpload(fileUrl: string, oldUrl?: string): Promise<string> {
  if (!fileUrl) {
    if (oldUrl) {
      await deleteFromS3(oldUrl);
    }
    return '';
  }

  const key = extractKey(fileUrl);
  if (!key.startsWith('tmp/')) return fileUrl;

  const finalKey = key.slice('tmp/'.length);
  await moveObject(key, finalKey);

  if (oldUrl) {
    await deleteFromS3(oldUrl);
  }

  return `https://${CDN_DOMAIN}/${finalKey}`;
}

export function extractUrlsFromHtml(content: string): string[] {
  if (!content) return [];
  const escapedDomain = CDN_DOMAIN.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  const regex = new RegExp(`https?://${escapedDomain}/[^\\s"'<>\\)\\]},;]+`, 'g');
  const matches = content.match(regex);
  if (!matches) return [];
  return [...new Set(matches.map((m) => m.replace(/[.,;:!?]+$/, '')))];
}

export async function confirmRichText(content: string, oldContent?: string): Promise<string> {
  if (!content) {
    if (oldContent) {
      const oldUrls = extractUrlsFromHtml(oldContent);
      await Promise.all(oldUrls.map((url) => deleteFromS3(url)));
    }
    return '';
  }

  const escapedDomain = CDN_DOMAIN.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  const regex = new RegExp(`https?://${escapedDomain}/tmp/[^\\s"'<>\\)\\]},;]+`, 'g');

  const rawMatches = content.match(regex);
  const uniqueMatches = rawMatches
    ? [...new Set(rawMatches.map((m) => m.replace(/[.,;:!?]+$/, '')))]
    : [];

  const resolved = await Promise.all(
    uniqueMatches.map((match) =>
      confirmUpload(match).then((url) => [match, url] as const)
    )
  );

  const finalContent = resolved.reduce(
    (acc, [match, url]) => acc.split(match).join(url),
    content
  );

  if (oldContent) {
    const oldUrls = extractUrlsFromHtml(oldContent);
    const newUrls = new Set(extractUrlsFromHtml(finalContent));
    await Promise.all(
      oldUrls
        .filter((url) => !newUrls.has(url))
        .map((url) => deleteFromS3(url))
    );
  }

  return finalContent;
}
