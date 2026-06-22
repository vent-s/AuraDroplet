import { NextResponse } from "next/server";
import {
  consumeCheckoutHandoff,
  readCheckoutHandoff,
} from "@/lib/checkout-handoff";
import { createCheckout } from "@/lib/medusa-checkout";

export async function POST(request: Request) {
  try {
    const { handoff, source, variantId, email } = (await request.json()) as {
      handoff?: string;
      source?: string;
      variantId?: string;
      email?: string;
    };

    if (handoff) {
      const data = await readCheckoutHandoff(handoff);
      if (!data) {
        return NextResponse.json(
          { error: "Checkout handoff expired or was not found." },
          { status: 404 },
        );
      }

      const session = await createCheckout({
        productKey: "velluracare",
        productHandle: data.productHandle,
        variantId: data.variantId,
        email: data.email,
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
