import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { auth } from "@/lib/auth";

/**
 * GET handler to fetch comments based on `entryId`.
 * This route doesn't require authentication.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const entryId = searchParams.get("entryId");

  if (!entryId) {
    return NextResponse.json({ error: "Entry ID is required" }, { status: 400 });
  }

  // First, get all parent comments
  const { data: parentComments, error: parentError } = await supabase
    .from("comments")
    .select(`
      *,
      reactions:comment_reactions(*)
    `)
    .eq("entry_id", entryId)
    .is("parent_id", null)
    .order("created_at", { ascending: false });

  if (parentError) {
    console.error("Parent comments error:", parentError);
    return NextResponse.json({ error: parentError.message }, { status: 500 });
  }

  // Then, get replies for each parent comment
  const commentsWithReplies = await Promise.all(
    (parentComments || []).map(async (comment) => {
      const { data: replies, error: repliesError } = await supabase
        .from("comments")
        .select(`
          *,
          reactions:comment_reactions(*)
        `)
        .eq("parent_id", comment.id)
        .order("created_at", { ascending: true });

      if (repliesError) {
        console.error("Replies error:", repliesError);
        return comment;
      }

      return {
        ...comment,
        replies: replies || []
      };
    })
  );

  return NextResponse.json(commentsWithReplies);
}

/**
 * POST handler to add a new comment.
 * This route requires authentication.
 */
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json() as { 
      entryId: string;
      content: string;
      parentId?: string;
    };
    const { entryId, content, parentId } = body;

    const { data: comment, error } = await supabase
      .from('comments')
      .insert({
        content,
        entry_id: entryId,
        parent_id: parentId || null,
        user_id: session.user.id,
        user_name: session.user.name || 'Anonymous',
        user_email: session.user.email
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(comment);
  } catch (error) {
    console.error('Insert comment error:', error);
    return NextResponse.json({ error: "Failed to add comment" }, { status: 500 });
  }
} 