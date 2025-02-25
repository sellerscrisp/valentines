// import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

// Extract account ID from the Cloudflare URL
const ACCOUNT_ID = 'c7bfe9a09b002ddbe32c142282d69eb5';

const BUCKET_NAME = 'scrapbook';
const WORKER_URL = 'https://r2-worker.s-c7b.workers.dev'; // Replace with your worker URL

const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_ACCESS_KEY || '',
    secretAccessKey: process.env.CLOUDFLARE_SECRET_ACCESS_KEY || '',
  },
});

export async function uploadToCloudflare(path: string, file: File | Buffer, contentType?: string): Promise<string> {
  const buffer = file instanceof File ? await file.arrayBuffer() : file;
  
  // Upload the file
  await s3.send(new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: path,
    Body: new Uint8Array(buffer),
    ContentType: contentType || (file instanceof File ? file.type : 'application/octet-stream'),
    CacheControl: 'max-age=31536000', // Cache for 1 year
  }));

  return `${WORKER_URL}/${path}`;
}

export async function getSignedFileUrl(path: string): Promise<string> {
  return `${WORKER_URL}/${path}`;
}

export async function deleteFromCloudflare(path: string): Promise<void> {
  await s3.send(new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: path,
  }));
}

export function getCloudflareUrl(path: string): string {
  return `${process.env.CLOUDFLARE_URL}/${path}`;
}

export { s3 }; 