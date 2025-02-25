import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabaseClient";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { entryId, content, parentId } = await request.json() as { 
      entryId: string; 
      content: string;
      parentId: string;
    };
    
    if (!supabaseAdmin) {
      throw new Error("Supabase admin client not available");
    }

    const { data, error } = await supabaseAdmin
      .from('comments')
      .insert({
        entry_id: entryId,
        content,
        parent_id: parentId,
        user_id: session.user.id,
        user_name: session.user.name || 'Anonymous'
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error adding reply:', error);
    return NextResponse.json({ error: "Failed to add reply" }, { status: 500 });
  }
} 