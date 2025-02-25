import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabaseClient";
import { uploadToCloudflare } from "@/lib/cloudflareClient";

// Add GET handler
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const email = searchParams.get('email');

  if (!userId && !email) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  try {
    const supabaseAdmin = createAdminClient();
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('avatar_url')
      .eq(userId ? 'id' : 'email', userId || email)
      .single();

    // Return the avatar URL directly, no need for authentication
    return NextResponse.json({ 
      avatarUrl: user?.avatar_url || null 
    }, {
      headers: {
        'Cache-Control': 'public, max-age=3600',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error) {
    console.error('Error fetching avatar:', error);
    return NextResponse.json({ avatarUrl: null });
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    // Get username from email (part before @)
    const username = session.user.email.split('@')[0];
    
    // Generate new filename with random string
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'png';
    const randomString = Math.random().toString(36).substring(2, 8);
    const fileName = `${username}-${randomString}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    // Upload to Cloudflare R2
    const publicUrl = await uploadToCloudflare(filePath, file);

    const supabaseAdmin = createAdminClient();
    // Update user profile with new avatar URL
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({ 
        avatar_url: publicUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', session.user.id);

    if (updateError) throw updateError;

    return NextResponse.json({ url: publicUrl });
  } catch (error) {
    console.error('Avatar upload error:', error);
    return NextResponse.json({ error: "Failed to upload avatar" }, { status: 500 });
  }
} 