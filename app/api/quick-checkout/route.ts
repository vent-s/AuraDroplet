import { NextRequest, NextResponse } from "next/server";
import { shopifyFetch, GQL } from "@/lib/shopify";

type CartCreateResult = {
  cartCreate?: {
    cart?: {
      id: string;
      checkoutUrl: string;
    };
    userErrors?: Array<{
      field?: string[];
      message: string;
    }>;
  };
};

export async function GET(req: NextRequest) {
  const variant = req.nextUrl.searchParams.get("variant");
  const qtyParam = req.nextUrl.searchParams.get("qty") ?? "1";
  const scentVariant = req.nextUrl.searchParams.get("scent");
  const quantity = Number.parseInt(qtyParam, 10);

  if (!variant) {
    return NextResponse.json({ error: "Missing variant" }, { status: 400 });
  }

  const lineQuantity = Number.isFinite(quantity) && quantity > 0 ? quantity : 1;

  try {
    const lines = [
      {
        merchandiseId: variant,
        quantity: lineQuantity,
      },
    ];

    if (scentVariant) {
      lines.push({
        merchandiseId: scentVariant,
        quantity: 1,
      });
    }

    const { data, errors } = await shopifyFetch<CartCreateResult>(GQL.cartCreate, {
      lines,
    });

    if (errors?.length) {
      return NextResponse.json({ error: errors[0]?.message ?? "Shopify error" }, { status: 502 });
    }

    const cart = data?.cartCreate?.cart;
    const userError = data?.cartCreate?.userErrors?.[0];

    if (userError) {
      return NextResponse.json({ error: userError.message }, { status: 400 });
    }

    if (!cart?.checkoutUrl) {
      return NextResponse.json({ error: "Unable to create checkout" }, { status: 502 });
    }

    // TODO: hook in analytics / discount parameters if needed.

    return NextResponse.redirect(cart.checkoutUrl, { status: 302 });
  } catch (error) {
    console.error("Failed to create quick checkout", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
