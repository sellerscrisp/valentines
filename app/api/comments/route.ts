import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabaseClient";

/**
 * GET handler to fetch comments based on `entryId`.
 * This route requires authentication.
 */
export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const entryId = searchParams.get('entryId');

  if (!entryId || !supabaseAdmin) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('comments')
      .select('*, reactions(*)')
      .eq('entry_id', entryId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 });
  }
}

/**
 * POST handler to add a new comment.
 * This route requires authentication.
 */
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { entryId, content } = await request.json() as { entryId: string; content: string };
    
    if (!supabaseAdmin) {
      throw new Error("Supabase admin client not available");
    }

    const { data, error } = await supabaseAdmin
      .from('comments')
      .insert({
        entry_id: entryId,
        content,
        user_id: session.user.id,
        user_name: session.user.name || 'Anonymous'
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error adding comment:', error);
    return NextResponse.json({ error: "Failed to add comment" }, { status: 500 });
  }
} 