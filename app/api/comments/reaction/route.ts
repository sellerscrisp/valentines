import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabaseClient";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { commentId, reactionType } = await request.json() as { commentId: string; reactionType: string };
    const supabaseAdmin = createAdminClient();
    
    // Check if reaction already exists
    const { data: existingReaction } = await supabaseAdmin
      .from('comment_reactions')
      .select('*')
      .eq('comment_id', commentId)
      .eq('user_id', session.user.id)
      .eq('reaction_type', reactionType)
      .single();

    if (existingReaction) {
      // If reaction exists, return success
      return NextResponse.json({ success: true, reaction: existingReaction });
    }

    // Add new reaction
    const { data: newReaction, error } = await supabaseAdmin
      .from('comment_reactions')
      .insert({
        comment_id: commentId,
        user_id: session.user.id,
        reaction_type: reactionType
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, reaction: newReaction });
  } catch (error) {
    console.error('Error adding reaction:', error);
    return NextResponse.json({ error: "Failed to add reaction" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { commentId, reactionType } = await request.json() as { commentId: string; reactionType: string };
    const supabaseAdmin = createAdminClient();
    
    const { error } = await supabaseAdmin
      .from('comment_reactions')
      .delete()
      .match({
        comment_id: commentId,
        user_id: session.user.id,
        reaction_type: reactionType
      });

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing reaction:', error);
    return NextResponse.json({ error: "Failed to remove reaction" }, { status: 500 });
  }
} 