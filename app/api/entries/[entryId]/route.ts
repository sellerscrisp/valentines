import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabaseClient";

export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const entryId = request.nextUrl.pathname.split('/').pop();
  if (!entryId) {
    return NextResponse.json({ error: "Invalid entry ID" }, { status: 400 });
  }

  try {
    const supabaseAdmin = createAdminClient();

    // First verify the user owns this entry
    const { data: entry } = await supabaseAdmin
      .from('scrapbook_entries')
      .select('user_id')
      .eq('id', entryId)
      .single();

    if (!entry || entry.user_id !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Delete associated comments first
    await supabaseAdmin
      .from('comments')
      .delete()
      .eq('entry_id', entryId);

    // Then delete the entry
    const { error } = await supabaseAdmin
      .from('scrapbook_entries')
      .delete()
      .eq('id', entryId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting entry:', error);
    return NextResponse.json(
      { error: "Failed to delete entry" },
      { status: 500 }
    );
  }
} 