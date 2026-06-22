import { NextResponse } from "next/server";
import {
  createCheckoutHandoff,
  isAuthorizedHandoffRequest,
} from "@/lib/checkout-handoff";

export async function POST(request: Request) {
  if (!isAuthorizedHandoffRequest(request)) {
    return NextResponse.json(
      { error: "Unauthorized checkout handoff request." },
      { status: 401 },
    );
  }

  try {
    const body = (await request.json()) as {
      productHandle?: string;
      variantId?: string;
      email?: string;
      customerName?: string;
      returnUrl?: string;
    };
    const { token } = await createCheckoutHandoff(body);
    const checkoutUrl = new URL("/checkout", request.url);
    checkoutUrl.searchParams.set("handoff", token);

    return NextResponse.json({
      checkoutUrl: checkoutUrl.toString(),
      expiresIn: Number(process.env.CHECKOUT_HANDOFF_TTL_SECONDS) || 15 * 60,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Could not create checkout handoff.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
