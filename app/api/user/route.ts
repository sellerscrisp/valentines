import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabaseClient";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }

  try {
    // Try to get existing user
    let { data: user } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("id", session.user.id)
      .single();

    // If user doesn't exist, create new user
    if (!user) {
      const { data: newUser, error: createError } = await supabaseAdmin
        .from("users")
        .insert({
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.name || null,
          avatar_url: session.user.image || null
        })
        .select()
        .single();

      if (createError) {
        throw createError;
      }

      user = newUser;
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("User operation failed:", error);
    return NextResponse.json(
      { error: "Failed to get or create user" },
      { status: 500 }
    );
  }
} 