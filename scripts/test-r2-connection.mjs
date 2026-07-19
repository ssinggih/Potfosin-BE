import { S3Client, PutObjectCommand, ListBucketsCommand } from '@aws-sdk/client-s3';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '..', '.env') });

const endpoint = process.env.R2_ENDPOINT;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const bucketName = process.env.R2_BUCKET_NAME;

console.log('=== R2 Connection Test ===');
console.log('Endpoint:', endpoint);
console.log('Bucket:', bucketName);
console.log('Key ID:', accessKeyId ? accessKeyId.slice(0, 5) + '...' : 'missing');
console.log('Secret:', secretAccessKey ? secretAccessKey.slice(0, 5) + '...' : 'missing');

if (!endpoint || !accessKeyId || !secretAccessKey) {
  console.error('\n❌ Missing R2 credentials in .env');
  process.exit(1);
}

const client = new S3Client({
  region: 'auto',
  endpoint,
  credentials: { accessKeyId, secretAccessKey },
});

async function main() {
  console.log('\n1. Testing list buckets...');
  try {
    const buckets = await client.send(new ListBucketsCommand({}));
    console.log('✅ Buckets:', buckets.Buckets.map(b => b.Name).join(', '));
  } catch (err) {
    console.error('❌ List buckets failed:', err.name, '-', err.message);
  }

  console.log('\n2. Uploading test file to', bucketName + '/portofolio-mockup-image/test-hello.txt');
  try {
    const result = await client.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: 'portofolio-mockup-image/test-hello.txt',
        Body: 'Hello from R2 test script!',
        ContentType: 'text/plain',
      })
    );
    console.log('✅ Upload success! ETag:', result.ETag);
  } catch (err) {
    console.error('❌ Upload failed:', err.name);
    console.error('   Message:', err.message);
    if (err.Code) console.error('   Code:', err.Code);
    if (err.$metadata) console.error('   HTTP:', err.$metadata.httpStatusCode);
  }
}

main().catch(console.error);
