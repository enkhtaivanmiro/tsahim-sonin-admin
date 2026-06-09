const fs = require('fs');
const path = require('path');

// Load .env.local manually
const envPath = path.join(__dirname, '.env.local');
console.log('Loading env from:', envPath);
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  const lines = content.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const parts = trimmed.split('=');
      const key = parts[0].trim();
      const val = parts.slice(1).join('=').trim();
      process.env[key] = val;
    }
  }
}

const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

async function testUpload() {
  const BUCKET = process.env.S3_BUCKET || 'sonin';
  const REGION = process.env.S3_REGION || 'us-east-1';

  const s3Client = new S3Client({
    region: REGION,
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
    },
  });

  // Try different folders
  const keysToTest = [
    'tmp/test-antigravity.txt',
    'rt/test-antigravity.txt',
    'images/test-antigravity.txt',
    'news/test-antigravity.txt'
  ];

  for (const key of keysToTest) {
    try {
      console.log(`Attempting upload to S3 at key: ${key}...`);
      const command = new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: Buffer.from('Hello from Antigravity IDE!'),
        ContentType: 'text/plain',
      });
      const result = await s3Client.send(command);
      console.log(`Upload to ${key} Succeeded! Response:`, result);
      return; // Stop on first success
    } catch (err) {
      console.error(`Upload to ${key} Failed with:`, err.message);
    }
  }
}

testUpload();
