import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabaseClient";

type Props = {
  params: Promise<{
    commentId: string;
  }>;
};

/**
 * GET handler to fetch a specific comment by ID.
 */
export async function GET(
  request: NextRequest,
  props: Props
): Promise<NextResponse> {
  try {
    const params = await props.params;
    const supabaseAdmin = createAdminClient();
    const { data, error } = await supabaseAdmin
      .from("comments")
      .select("*")
      .eq("id", params.commentId)
      .single();

    if (error) {
      throw error;
    }
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching comment:', error);
    return NextResponse.json({ error: "Failed to fetch comment" }, { status: 500 });
  }
}

/**
 * DELETE handler to remove a comment.
 */
export async function DELETE(
  request: NextRequest,
  props: Props
): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const params = await props.params;
    const supabaseAdmin = createAdminClient();
    const { error } = await supabaseAdmin
      .from('comments')
      .delete()
      .eq('id', params.commentId)
      .eq('user_id', session.user.id);

    if (error) {
      throw error;
    }
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
  request: NextRequest,
  props: Props
): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const params = await props.params;
    const { content } = await request.json() as { content: string };
    const supabaseAdmin = createAdminClient();

    // Verify ownership
    const { data: comment, error: fetchError } = await supabaseAdmin
      .from("comments")
      .select("user_id")
      .eq("id", params.commentId)
      .single();

    if (fetchError) {
      throw fetchError;
    }
    if (comment?.user_id !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Update comment
    const { data, error } = await supabaseAdmin
      .from("comments")
      .update({ 
        content, 
        is_edited: true, 
        updated_at: new Date().toISOString() 
      })
      .eq("id", params.commentId)
      .select()
      .single();

    if (error) {
      throw error;
    }
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating comment:', error);
    return NextResponse.json({ error: "Failed to update comment" }, { status: 500 });
  }
} 