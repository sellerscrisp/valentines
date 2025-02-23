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
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { entryId, content, parentId } = await request.json();

    if (!content?.trim()) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    const { data: comment, error } = await supabase
      .from("comments")
      .insert({
        entry_id: entryId,
        content: content.trim(),
        parent_id: parentId || null,
        user_id: session.user.email,
        user_name: session.user.name || session.user.email
      })
      .select()
      .single();

    if (error) {
      console.error("Insert comment error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(comment);
  } catch (error) {
    console.error("Comment POST error:", error);
    return NextResponse.json(
      { error: "Failed to create comment" }, 
      { status: 500 }
    );
  }
} 