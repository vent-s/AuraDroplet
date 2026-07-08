import { NextResponse } from "next/server";
import {
  setShippingAddress,
  type ShippingAddressInput,
} from "@/lib/medusa-checkout";
import {
  isDirectPaymentId,
  setDirectPaymentShipping,
} from "@/lib/stripe-direct";

export async function POST(request: Request) {
  try {
    const { cartId, address } = (await request.json()) as {
      cartId?: string;
      address?: ShippingAddressInput;
    };

    if (!cartId || !address?.address_1 || !address?.postal_code) {
      return NextResponse.json(
        { error: "Missing cartId or a complete shipping address." },
        { status: 400 },
      );
    }

    if (isDirectPaymentId(cartId)) {
      await setDirectPaymentShipping(cartId, address);
    } else {
      await setShippingAddress(cartId, address);
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Could not save the address.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
