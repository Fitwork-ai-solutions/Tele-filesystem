import { NextResponse } from "next/server";
import { getAuthFromCookie } from "@/lib/auth";
import { createServerClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const auth = await getAuthFromCookie();
    if (!auth) {
      return NextResponse.json(
        { data: null, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const db = createServerClient();
    const { data: user, error } = await db
      .from("users")
      .select("*")
      .eq("id", auth.userId)
      .single();

    if (error || !user) {
      return NextResponse.json(
        { data: null, error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: user, error: null });
  } catch (err) {
    console.error("Get user error:", err);
    return NextResponse.json(
      { data: null, error: "Internal server error" },
      { status: 500 }
    );
  }
}
