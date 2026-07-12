import { NextResponse } from "next/server";
import { isAdminSession } from "@/lib/admin-auth";
import { fetchAffiliateStats } from "@/lib/affiliates";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isAdminSession()) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const stats = await fetchAffiliateStats();
    return NextResponse.json(stats);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Could not load affiliate stats.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
