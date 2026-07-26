import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    const { data: company } = await supabase
      .from("companies")
      .select("slug")
      .eq("owner_id", user.id)
      .eq("claimed", true)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    return NextResponse.json({
      user: {
        email: user.email ?? "account",
        companySlug: company?.slug ?? null,
      },
    });
  } catch (err) {
    console.error("[api/auth/session]", err);
    return NextResponse.json({ user: null }, { status: 200 });
  }
}
