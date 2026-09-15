import { NextResponse } from "next/server";
import { isPaidPlan } from "@/features/plan/entitlements";
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

    const [{ data: company }, { data: owned }, { data: memberships }] = await Promise.all([
      supabase
        .from("companies")
        .select("slug")
        .eq("owner_id", user.id)
        .eq("claimed", true)
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle(),
      supabase.from("companies").select("plan").eq("owner_id", user.id),
      supabase
        .from("company_members")
        .select("company:companies!company_id(plan)")
        .eq("user_id", user.id),
    ]);

    /* Any workspace on Pro or Founding — the site stops offering Pro to it. */
    const plans = [
      ...(owned ?? []).map((c) => c.plan as string | null),
      ...(memberships ?? []).map((m) => {
        const c = Array.isArray(m.company) ? m.company[0] : m.company;
        return (c?.plan as string | null) ?? null;
      }),
    ];

    return NextResponse.json({
      user: {
        email: user.email ?? "account",
        companySlug: company?.slug ?? null,
        hasPaidPlan: plans.some((plan) => isPaidPlan(plan)),
      },
    });
  } catch (err) {
    console.error("[api/auth/session]", err);
    return NextResponse.json({ user: null }, { status: 200 });
  }
}
