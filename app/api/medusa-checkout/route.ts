import { NextResponse } from "next/server";
import {
  consumeCheckoutHandoff,
  readCheckoutHandoff,
} from "@/lib/checkout-handoff";
import { createCheckout } from "@/lib/medusa-checkout";
import { createDirectPayment } from "@/lib/stripe-direct";

export async function POST(request: Request) {
  try {
    const { handoff, source, variantId, email, test } =
      (await request.json()) as {
        handoff?: string;
        source?: string;
        variantId?: string;
        email?: string;
        test?: boolean;
      };

    if (handoff) {
      const data = await readCheckoutHandoff(handoff);
      if (!data) {
        return NextResponse.json(
          { error: "Checkout handoff expired or was not found." },
          { status: 404 },
        );
      }

      // Cart handoffs (novalife.science etc.) have no Medusa products; the
      // amount is charged directly through Stripe.
      if (data.items?.length) {
        const direct = await createDirectPayment(data);
        await consumeCheckoutHandoff(handoff);

        return NextResponse.json({
          cartId: direct.paymentIntentId,
          clientSecret: direct.clientSecret,
          amount: direct.amount / 100,
          currency: direct.currency,
        });
      }

      const session = await createCheckout({
        productKey: "velluracare",
        productHandle: data.productHandle,
        variantId: data.variantId,
        email: data.email ?? "",
      });
      await consumeCheckoutHandoff(handoff);

      return NextResponse.json(session);
    }

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "A valid email is required." },
        { status: 400 },
      );
    }

    if (test === true && source === "checkout-test") {
      const now = Date.now();
      const direct = await createDirectPayment({
        source: "checkout-test",
        items: [
          {
            id: "checkout-test",
            sku: "CHECKOUT-TEST",
            name: "Checkout test payment",
            quantity: 1,
            unitAmount: 50,
            lineTotal: 50,
          },
        ],
        currency: "usd",
        cartTotal: 50,
        email,
        createdAt: now,
        expiresAt: now + 15 * 60 * 1000,
      });

      return NextResponse.json({
        cartId: direct.paymentIntentId,
        clientSecret: direct.clientSecret,
        amount: direct.amount / 100,
        currency: direct.currency,
      });
    }

    if (source === "velluracare") {
      return NextResponse.json(
        { error: "VelluraCare checkout requires a secure handoff token." },
        { status: 400 },
      );
    }

    const productKey = source === "velluracare" ? "velluracare" : "satielle";
    const session = await createCheckout({
      productKey,
      variantId,
      email,
    });

    return NextResponse.json(session);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Checkout failed.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
