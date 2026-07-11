import { NextResponse } from "next/server";
import { isAdminSession } from "@/lib/admin-auth";
import {
  sendOrderConfirmationEmail,
  sendTrackingEmail,
} from "@/lib/order-email";

export const dynamic = "force-dynamic";

/** Sends sample copies of both customer emails so the admin can preview them. */
export async function POST(request: Request) {
  if (!isAdminSession()) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { to } = (await request.json().catch(() => ({}))) as { to?: unknown };
  if (typeof to !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
    return NextResponse.json(
      { error: "Enter a valid email address." },
      { status: 400 },
    );
  }

  const origin =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ||
    new URL(request.url).origin;
  const sampleOrderId = "pi_sample_preview";
  const statusUrl = `${origin}/order/${sampleOrderId}`;
  const items = [
    { name: "Satielle Diffuser Kit", quantity: 1, lineTotal: 6900 },
  ];

  try {
    await sendOrderConfirmationEmail({
      to,
      orderId: sampleOrderId,
      statusUrl,
      customerName: "Sample Customer",
      amount: 6900,
      currency: "usd",
      items,
    });
    await sendTrackingEmail({
      to,
      orderId: sampleOrderId,
      customerName: "Sample Customer",
      trackingNumber: "9434630109355155754687",
      carrierLabel: "USPS",
      trackingUrl:
        "https://tools.usps.com/go/TrackConfirmAction?tLabels=9434630109355155754687",
      statusUrl,
      items,
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Test email failed.", err);
    const message =
      err instanceof Error ? err.message : "The test emails could not be sent.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
