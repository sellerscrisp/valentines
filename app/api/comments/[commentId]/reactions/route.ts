import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { supabase } from "@/lib/supabaseClient";

// GET handler: Fetch all reactions for a given comment
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

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

// POST handler: Create a reaction for a comment
export async function POST(
  request: Request,
  { params }: { params: Promise<{ commentId: string }> }
) {
  const session = await auth();
  const { commentId } = await params;
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json() as { reactionType: string };
    const reaction_type = body.reactionType;

    if (!reaction_type) {
      return NextResponse.json({ error: "Reaction type is required" }, { status: 400 });
    }

    // Check for existing reaction of the same type
    const { data: existingReaction, error: checkError } = await supabase
      .from('comment_reactions')
      .select('*')
      .eq('comment_id', commentId)  // Use extracted ID
      .eq('user_id', session.user.id)
      .eq('reaction_type', reaction_type)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }

    if (existingReaction) {
      // If reaction already exists, remove it (toggle behavior)
      const { error } = await supabase
        .from('comment_reactions')
        .delete()
        .eq('id', existingReaction.id);

      if (error) throw error;
    } else {
      // Add new reaction
      const { error } = await supabase
        .from('comment_reactions')
        .insert({
          comment_id: commentId,  // Use extracted ID
          user_id: session.user.id,
          reaction_type
        });

      if (error) throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error handling reaction:', error);
    return NextResponse.json(
      { error: "Failed to handle reaction" },
      { status: 500 }
    );
  }
}

// DELETE handler: Remove a reaction from a comment
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ commentId: string }> }
) {
  const session = await auth();
  const { commentId } = await params;

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const reactionType = searchParams.get('type');

    if (!reactionType) {
      return NextResponse.json({ error: "Reaction type is required" }, { status: 400 });
    }

    const { error } = await supabase
      .from('comment_reactions')
      .delete()
      .eq('comment_id', commentId)  // Use extracted ID
      .eq('user_id', session.user.id)
      .eq('reaction_type', reactionType);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing reaction:', error);
    return NextResponse.json(
      { error: "Failed to remove reaction" },
      { status: 500 }
    );
  }
}

// PATCH handler: Update a comment (ownership verified directly in the route handler)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ commentId: string }> }
) {
  const { commentId } = await params;

  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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
