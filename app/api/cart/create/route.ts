import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const checkoutUrl = new URL("/checkout", req.url);
  checkoutUrl.searchParams.set("source", "satielle");

  return NextResponse.json({
    checkoutUrl: `${checkoutUrl.pathname}${checkoutUrl.search}`,
  });
}
