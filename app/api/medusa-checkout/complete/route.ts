import { NextResponse } from "next/server";
import { completeCheckout } from "@/lib/medusa-checkout";
import {
  sendCompletedOrderNotification,
  sendOrderConfirmationEmail,
} from "@/lib/order-email";
import {
  confirmDirectPaymentSucceeded,
  isDirectPaymentId,
  paymentIntentIdFromClientSecret,
} from "@/lib/stripe-direct";

export async function POST(request: Request) {
  try {
    const { cartId, clientSecret } = (await request.json()) as {
      cartId?: string;
      clientSecret?: string;
    };

    if (!cartId) {
      return NextResponse.json({ error: "Missing cartId." }, { status: 400 });
    }

    // Direct cart payments have no Medusa cart to complete; verify the
    // PaymentIntent succeeded and use it as the order reference.
    const order = isDirectPaymentId(cartId)
      ? await confirmDirectPaymentSucceeded(cartId)
      : await completeCheckout(cartId);

    // Every checkout has a Stripe PaymentIntent, which is what the customer
    // /order status page looks up (Medusa order ids can't be resolved there).
    const paymentIntentId = isDirectPaymentId(cartId)
      ? cartId
      : clientSecret
        ? paymentIntentIdFromClientSecret(clientSecret)
        : null;
    const origin =
      process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ||
      new URL(request.url).origin;
    const statusUrl = paymentIntentId
      ? `${origin}/order/${paymentIntentId}`
      : undefined;

    try {
      await sendCompletedOrderNotification(order);
    } catch (err) {
      // An email delivery failure must not turn a paid checkout into an error.
      console.error("Completed-order notification failed.", err);
    }

    if (order.customerEmail && statusUrl && paymentIntentId) {
      try {
        await sendOrderConfirmationEmail({
          to: order.customerEmail,
          orderId: paymentIntentId,
          statusUrl,
          amount: order.amount,
          currency: order.currency,
          items: order.items,
        });
      } catch (err) {
        console.error("Order confirmation email failed.", err);
      }
    }

    return NextResponse.json({ ...order, statusPath: paymentIntentId ? `/order/${paymentIntentId}` : undefined });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Could not complete the order.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
