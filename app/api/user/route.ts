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
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (error) {
      throw error;
    }
    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const updates = await request.json() as Record<string, unknown>;
    const supabaseAdmin = createAdminClient();
    
    const { data, error } = await supabaseAdmin
      .from('users')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', session.user.id)
      .select()
      .single();

    if (error) {
      throw error;
    }
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
} 