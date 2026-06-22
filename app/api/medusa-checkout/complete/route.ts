import { NextResponse } from "next/server";
import { completeCheckout } from "@/lib/medusa-checkout";

export async function POST(request: Request) {
  try {
    const { cartId } = (await request.json()) as { cartId?: string };

    if (!cartId) {
      return NextResponse.json({ error: "Missing cartId." }, { status: 400 });
    }

    const order = await completeCheckout(cartId);
    return NextResponse.json(order);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Could not complete the order.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
