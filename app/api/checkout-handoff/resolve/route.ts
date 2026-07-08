import { NextResponse } from "next/server";
import { handoffTitle, readCheckoutHandoff } from "@/lib/checkout-handoff";

export async function POST(request: Request) {
  try {
    const { handoff } = (await request.json()) as { handoff?: string };
    const data = await readCheckoutHandoff(handoff);

    if (!data) {
      return NextResponse.json(
        { error: "Checkout handoff expired or was not found." },
        { status: 404 },
      );
    }

    const title = handoffTitle(data);
    return NextResponse.json({
      source: data.source,
      title,
      lineItemLabel: data.items?.length ? title : `${title} - first month`,
      items: data.items,
      currency: data.currency,
      cartTotal: data.cartTotal,
      email: data.email,
      customerName: data.customerName,
      posthogDistinctId: data.posthogDistinctId,
      returnUrl: data.returnUrl,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Could not read checkout handoff.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
