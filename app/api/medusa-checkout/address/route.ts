import { NextResponse } from "next/server";
import {
  setShippingAddress,
  type ShippingAddressInput,
} from "@/lib/medusa-checkout";
import {
  isDirectPaymentId,
  setDirectPaymentShipping,
  setShippingForClientSecret,
} from "@/lib/stripe-direct";

export async function POST(request: Request) {
  try {
    const { cartId, address, clientSecret } = (await request.json()) as {
      cartId?: string;
      address?: ShippingAddressInput;
      clientSecret?: string;
    };

    if (
      !cartId ||
      !address?.first_name ||
      !address.last_name ||
      !address.address_1 ||
      !address.city ||
      !address.province ||
      !address.postal_code ||
      address.country_code?.toLowerCase() !== "us"
    ) {
      return NextResponse.json(
        { error: "Missing cartId or a complete shipping address." },
        { status: 400 },
      );
    }

    if (isDirectPaymentId(cartId)) {
      await setDirectPaymentShipping(cartId, address);
    } else {
      await setShippingAddress(cartId, address);
      // Mirror the address onto the Stripe PaymentIntent so the admin order
      // page can read it from Stripe. A mirror failure must not block checkout.
      if (clientSecret) {
        try {
          await setShippingForClientSecret(clientSecret, address);
        } catch (err) {
          console.error("Could not mirror shipping to Stripe.", err);
        }
      }
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Could not save the address.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
