import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const checkoutUrl = new URL("/checkout", req.url);
  checkoutUrl.searchParams.set("source", "satielle");

  const email = req.nextUrl.searchParams.get("email");
  if (email) checkoutUrl.searchParams.set("email", email);

  return NextResponse.redirect(checkoutUrl, { status: 302 });
}
