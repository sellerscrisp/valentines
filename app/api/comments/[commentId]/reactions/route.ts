import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabase } from "@/lib/supabaseClient";

// GET handler: Fetch all reactions for a given comment
export async function GET(
  req: Request,
  context: { params: Promise<Record<string, string>> }
) {
  const { commentId } = await context.params;

  const { data, error } = await supabase
    .from("comments")
    .select("*")
    .eq("id", commentId)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

// POST handler: Create a reaction for a comment
export async function POST(
  req: Request,
  context: { params: Promise<Record<string, string>> }
) {
  const { commentId } = await context.params;

  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { reactionType } = await req.json();

    const { data: reaction, error } = await supabase
      .from("comment_reactions")
      .insert({
        comment_id: commentId,
        user_id: session.user.email,
        reaction_type: reactionType,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(reaction);
  } catch {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// DELETE handler: Remove a reaction from a comment
export async function DELETE(
  req: Request,
  context: { params: Promise<Record<string, string>> }
) {
  const { commentId } = await context.params;

  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { reactionType } = await req.json();

    const { error } = await supabase
      .from("comment_reactions")
      .delete()
      .eq("comment_id", commentId)
      .eq("user_id", session.user.email)
      .eq("reaction_type", reactionType);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// PATCH handler: Update a comment (ownership verified directly in the route handler)
export async function PATCH(
  req: Request,
  context: { params: Promise<Record<string, string>> }
) {
  const { commentId } = await context.params;

  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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
    .update({
      content,
      is_edited: true,
      updated_at: new Date().toISOString(),
    })
    .eq("id", commentId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}
