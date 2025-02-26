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

async function migrateAvatars() {
  try {
    // List all avatars in the 'avatars' bucket
    const { data: avatars, error } = await supabase
      .storage
      .from('avatars')
      .list();

    if (error) throw error;

    // console.log(`Found ${avatars.length} avatars to migrate`);

    // Get all users to update their avatar URLs
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, avatar_url');

    if (usersError) throw usersError;

    // Create a map of avatar paths to user IDs
    const avatarToUserMap = new Map();
    users.forEach(user => {
      if (user.avatar_url && user.avatar_url.includes('/avatars/')) {
        const avatarName = user.avatar_url.split('/avatars/').pop();
        if (avatarName) {
          avatarToUserMap.set(avatarName, user.id);
        }
      }
    });

    for (const avatar of avatars) {
      // Get the avatar file data
      const { data: fileData, error: fileError } = await supabase
        .storage
        .from('avatars')
        .download(avatar.name);

      if (fileError) {
        console.error(`Error downloading avatar ${avatar.name}:`, fileError);
        continue;
      }

      // Upload to Cloudflare R2
      await s3.send(new PutObjectCommand({
        Bucket: 'scrapbook',
        Key: `avatars/${avatar.name}`,
        Body: new Uint8Array(await fileData.arrayBuffer()),
        ContentType: fileData.type || 'image/jpeg',
        CacheControl: 'max-age=3600'
      }));

      // If this avatar is referenced by a user, update their avatar_url
      const userId = avatarToUserMap.get(avatar.name);
      if (userId) {
        const newAvatarUrl = `${process.env.CLOUDFLARE_URL}/avatars/${avatar.name}`;
        const { error: updateError } = await supabase
          .from('users')
          .update({ avatar_url: newAvatarUrl })
          .eq('id', userId);

        if (updateError) {
          console.error(`Error updating user ${userId} avatar:`, updateError);
          continue;
        }
        //console.log(`Updated avatar URL for user ${userId}`);
      }

      // console.log(`Migrated avatar: ${avatar.name}`);
    }

    // console.log('Avatar migration completed successfully');
  } catch (error) {
    console.error('Avatar migration failed:', error);
  }
}

migrateAvatars(); 