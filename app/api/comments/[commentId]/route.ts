import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabase } from "@/lib/supabaseClient";
import { supabaseAdmin } from "@/lib/supabaseClient";

/**
 * GET handler to fetch a specific comment by ID.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ commentId: string }> }
) {
  const { commentId } = await params;

  const { data, error } = await supabase
    .from("comments")
    .select("*")
    .eq("id", commentId)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

/**
 * DELETE handler to remove a comment.
 */
export async function DELETE(
  request: Request,
  { params }: { params: { commentId: string } }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    if (!supabaseAdmin) {
      throw new Error("Supabase admin client not available");
    }

    const { error } = await supabaseAdmin
      .from('comments')
      .delete()
      .eq('id', params.commentId)
      .eq('user_id', session.user.id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting comment:', error);
    return NextResponse.json({ error: "Failed to delete comment" }, { status: 500 });
  }
}

/**
 * PATCH handler to update a comment's content.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ commentId: string }> }
) {
  const { commentId } = await params;
  const session = await auth();
  const { content } = await req.json() as { content: string };

  // Verify ownership
  const { data: comment, error: fetchError } = await supabase
    .from("comments")
    .select("user_id")
    .eq("id", commentId)
    .single();

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }

  if (comment?.user_id !== session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Update comment
  const { data, error } = await supabase
    .from("comments")
    .update({ content, is_edited: true, updated_at: new Date().toISOString() })
    .eq("id", commentId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
} 