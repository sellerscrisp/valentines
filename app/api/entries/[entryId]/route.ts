import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { withAuth } from "@/lib/baseHandler";

export const GET = withAuth<{ entryId: string }>(async (req) => {
  const { entryId } = (req as any).params;

  const { data: entry, error } = await supabase
    .from("scrapbook_entries")
    .select("*")
    .eq("id", entryId)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(entry);
});

export const DELETE = withAuth(async (req: Request, session: any) => {
  const { entryId } = (req as any).params;

  const { data: entry, error: fetchError } = await supabase
    .from("scrapbook_entries")
    .select("user_id")
    .eq("id", entryId)
    .single();

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }

  if (entry?.user_id !== session.user.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { error } = await supabase
    .from("scrapbook_entries")
    .delete()
    .eq("id", entryId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}); 