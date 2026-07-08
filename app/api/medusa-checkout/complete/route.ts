import { NextResponse } from "next/server";
import { completeCheckout } from "@/lib/medusa-checkout";
import {
  confirmDirectPaymentSucceeded,
  isDirectPaymentId,
} from "@/lib/stripe-direct";

export async function POST(request: Request) {
  try {
    const { cartId } = (await request.json()) as { cartId?: string };

    if (!cartId) {
      return NextResponse.json({ error: "Missing cartId." }, { status: 400 });
    }

    // Direct cart payments have no Medusa cart to complete; verify the
    // PaymentIntent succeeded and use it as the order reference.
    const order = isDirectPaymentId(cartId)
      ? await confirmDirectPaymentSucceeded(cartId)
      : await completeCheckout(cartId);
    return NextResponse.json(order);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Could not complete the order.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
