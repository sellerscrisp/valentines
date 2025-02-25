import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabaseClient";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabaseAdmin = createAdminClient();
    const { data, error } = await supabaseAdmin
      .from("scrapbook_entries")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    console.error('Fetch error:', error);
    return NextResponse.json({ error: "Failed to fetch entries" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id, ...data } = await request.json() as { id: string; [key: string]: any };
    const supabaseAdmin = createAdminClient();

    const { error } = await supabaseAdmin
      .from("scrapbook_entries")
      .update(data)
      .eq("id", id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update error:', error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
} 