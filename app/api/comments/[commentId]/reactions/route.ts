import { NextResponse } from "next/server";
import { withAuth } from "@/lib/baseHandler";
import { supabase } from "@/lib/supabaseClient";

export const POST = withAuth(async (req, context, session) => {
  try {
    const { commentId } = context.params;
    const { reactionType } = await req.json();

    // Check if reaction already exists
    const { data: existingReaction, error: checkError } = await supabase
      .from("comment_reactions")
      .select("*")
      .eq("comment_id", commentId)
      .eq("user_id", session.user.email)
      .eq("reaction_type", reactionType)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      return NextResponse.json({ error: checkError.message }, { status: 500 });
    }

    if (existingReaction) {
      return NextResponse.json(existingReaction);
    }

    const { data: reaction, error } = await supabase
      .from("comment_reactions")
      .insert({
        comment_id: commentId,
        user_id: session.user.email,
        reaction_type: reactionType,
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(reaction);
  } catch {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
});

export const DELETE = withAuth(async (req, context, session) => {
  try {
    const { commentId } = context.params;
    const { reactionType } = await req.json();

    const { error } = await supabase
      .from("comment_reactions")
      .delete()
      .eq("comment_id", commentId)
      .eq("user_id", session.user.email)
      .eq("reaction_type", reactionType);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
});

export const PATCH = withAuth(async (req, { params }: { params: { commentId: string } }, session) => {
  const { commentId } = params;
  const { content } = await req.json();

  // Verify ownership
  const { data: comment, error: fetchError } = await supabase
    .from("comments")
    .select("user_id")
    .eq("id", commentId)
    .single();

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }

  if (comment?.user_id !== session.user.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Update the comment
  const { data, error } = await supabase
    .from("comments")
    .update({ content, is_edited: true, updated_at: new Date().toISOString() })
    .eq("id", commentId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}); 