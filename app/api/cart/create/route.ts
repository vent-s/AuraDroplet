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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { lines } = body;

    if (!lines || !Array.isArray(lines) || lines.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    const { data, errors } = await shopifyFetch<CartCreateResult>(GQL.cartCreate, {
      lines,
    });

    if (errors?.length) {
      return NextResponse.json(
        { error: errors[0]?.message ?? "Shopify error" },
        { status: 502 }
      );
    }

    const cart = data?.cartCreate?.cart;
    const userError = data?.cartCreate?.userErrors?.[0];

    if (userError) {
      return NextResponse.json({ error: userError.message }, { status: 400 });
    }

    if (!cart?.checkoutUrl) {
      return NextResponse.json(
        { error: "Unable to create checkout" },
        { status: 502 }
      );
    }

    return NextResponse.json({
      checkoutUrl: cart.checkoutUrl,
      cartId: cart.id,
    });
  } catch (error) {
    console.error("Failed to create cart:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
