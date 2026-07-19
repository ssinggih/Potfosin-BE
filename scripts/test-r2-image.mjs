import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { readFileSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '..', '.env') });

const endpoint = process.env.R2_ENDPOINT;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const bucketName = process.env.R2_BUCKET_NAME;

const client = new S3Client({
  region: 'auto',
  endpoint,
  credentials: { accessKeyId, secretAccessKey },
});

async function testImageUpload() {
  console.log('=== Test Image Upload (simulasi flow NestJS) ===\n');

  // Simulasi buffer dari file upload
  const imagePath = resolve(__dirname, '..', 'scripts', 'test-image.png');
  let imageBuffer;

  try {
    imageBuffer = readFileSync(imagePath);
    console.log(`Read file: ${imagePath} (${imageBuffer.length} bytes)`);
  } catch {
    console.log('No test image found, creating 1x1 PNG pixel...');
    // Minimal PNG: 1x1 red pixel
    const png = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG header
      0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, // IHDR chunk
      0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, // 1x1 pixel
      0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, // 8-bit RGBA
      0xDE, 0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41, // IDAT chunk
      0x54, 0x08, 0xD7, 0x63, 0x60, 0x60, 0x00, 0x00, // deflate
      0x00, 0x02, 0x00, 0x01, 0xE5, 0x27, 0xDE, 0xFC, // data
      0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, // IEND
      0xAE, 0x42, 0x60, 0x82,
    ]);
    imageBuffer = png;
    console.log(`Created 1x1 PNG pixel (${imageBuffer.length} bytes)`);
  }

  // === Simulasi flow NestJS: buffer → base64 → kirim TCP → terima → Buffer.from(base64) ===
  console.log('\n1. Gateway: convert buffer ke base64...');
  const base64 = imageBuffer.toString('base64');
  console.log(`   Base64 length: ${base64.length} chars`);

  console.log('\n2. Portfolio Service: convert base64 balik ke Buffer...');
  const restoredBuffer = Buffer.from(base64, 'base64');
  console.log(`   Restored buffer: ${restoredBuffer.length} bytes`);
  console.log(`   Buffer match: ${imageBuffer.equals(restoredBuffer)}`);

  // === Upload ke R2 ===
  console.log('\n3. Upload image ke R2...');
  const key = `portofolio-mockup-image/test-upload-${Date.now()}.png`;

  try {
    const result = await client.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: restoredBuffer,
        ContentType: 'image/png',
      }),
    );
    console.log(`✅ Upload success!`);

    const publicUrl = `https://pub-3a7d8dbbcc014b04a39701b84884e71c.r2.dev/${key}`;
    console.log(`   URL: ${publicUrl}`);
  } catch (err) {
    console.error(`❌ Upload failed:`);
    console.error(`   Name: ${err.name}`);
    console.error(`   Message: ${err.message}`);
    console.error(`   Code: ${err.Code}`);
  }
}

testImageUpload().catch(console.error);
