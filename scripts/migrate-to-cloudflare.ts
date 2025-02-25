import { config } from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import fetch from 'node-fetch';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

// Verify environment variables are loaded
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing required environment variables');
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const s3 = new S3Client({
  region: 'auto',
  endpoint: process.env.CLOUDFLARE_URL,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_ACCESS_KEY!,
    secretAccessKey: process.env.CLOUDFLARE_SECRET_ACCESS_KEY!,
  },
});

async function migrateImages() {
  try {
    // Get all entries with images
    const { data: entries, error } = await supabase
      .from('scrapbook_entries')
      .select('id, images')
      .not('images', 'is', null);

    if (error) throw error;

    console.log(`Found ${entries.length} entries with images to migrate`);

    for (const entry of entries) {
      const updatedImages = [];

      for (const image of entry.images) {
        // Skip if not a Supabase URL
        if (!image.url.includes('supabase')) continue;

        // Get original filename from URL
        const filename = image.url.split('/').pop();
        const newPath = `entries/${filename}`;

        // Download image from Supabase
        const response = await fetch(image.url);
        const buffer = await response.arrayBuffer();

        // Upload to Cloudflare R2
        await s3.send(new PutObjectCommand({
          Bucket: 'scrapbook',
          Key: newPath,
          Body: new Uint8Array(buffer),
          ContentType: response.headers.get('content-type') || 'image/jpeg',
          CacheControl: 'max-age=3600'
        }));

        // Update image URL
        const newUrl = `${process.env.CLOUDFLARE_URL}/${newPath}`;
        updatedImages.push({
          ...image,
          url: newUrl
        });

        console.log(`Migrated: ${filename}`);
      }

      // Update entry with new URLs
      const { error: updateError } = await supabase
        .from('scrapbook_entries')
        .update({ images: updatedImages })
        .eq('id', entry.id);

      if (updateError) throw updateError;
    }

    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

migrateImages(); 