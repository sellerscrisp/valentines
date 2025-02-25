import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabaseClient";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { parentId, content } = await request.json() as { parentId: string; content: string };
    const supabaseAdmin = createAdminClient();
    
    const { data, error } = await supabaseAdmin
      .from('comments')
      .insert({
        parent_id: parentId,
        content,
        user_id: session.user.id
      })
      .select('*, user:users(name, avatar_url)')
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error adding reply:', error);
    return NextResponse.json({ error: "Failed to add reply" }, { status: 500 });
  }
} 