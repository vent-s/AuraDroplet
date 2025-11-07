import { NextRequest, NextResponse } from "next/server";
import { shopifyFetch, GQL } from "@/lib/shopify";

type ProductByHandleResult = {
  product?: {
    id: string;
    title: string;
    variants?: {
      nodes: Array<{
        id: string;
        title: string;
        availableForSale: boolean;
      }>;
    };
  };
};

export async function GET(req: NextRequest) {
  const handle = req.nextUrl.searchParams.get("handle") ?? "auradroplet";

  try {
    const { data, errors } = await shopifyFetch<ProductByHandleResult>(GQL.productByHandle, {
      handle,
    });

    if (errors?.length) {
      return NextResponse.json({ error: errors[0]?.message ?? "Shopify error" }, { status: 502 });
    }

    const variants = data?.product?.variants?.nodes ?? [];
    const variant = variants.find((entry) => entry.availableForSale);

    if (!variant) {
      return NextResponse.json({ error: "No variant available" }, { status: 404 });
    }

    return NextResponse.json({ variantId: variant.id, title: variant.title });
  } catch (error) {
    console.error("Failed to load product variant", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
