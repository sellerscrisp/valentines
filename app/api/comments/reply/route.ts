import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabaseClient";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { parentId, content, entryId } = await request.json() as { 
      parentId: string; 
      content: string; 
      entryId: string; 
    };
    const supabaseAdmin = createAdminClient();

    // First, check if the parent comment is a top-level comment or a reply
    const { data: parentComment } = await supabaseAdmin
      .from('comments')
      .select('parent_id')
      .eq('id', parentId)
      .single();

    // Use the original top-level comment's ID as parent_id
    const actualParentId = parentComment?.parent_id || parentId;

    const { data: newReply, error: insertError } = await supabaseAdmin
      .from('comments')
      .insert({
        parent_id: actualParentId, // Use the top-level comment's ID
        entry_id: entryId,
        content,
        user_id: session.user.id,
        user_name: session.user.name || 'Anonymous',
        user_email: session.user.email
      })
      .select()
      .single();

    if (insertError) throw insertError;

    return NextResponse.json({
      ...newReply,
      reactions: [],
      replies: []
    });
  } catch (error) {
    console.error('Error adding reply:', error);
    return NextResponse.json({ error: "Failed to add reply" }, { status: 500 });
  }
} 