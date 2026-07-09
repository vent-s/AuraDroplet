import { NextResponse } from "next/server";
import { isAdminSession } from "@/lib/admin-auth";
import { sendTrackingEmail } from "@/lib/order-email";
import {
  CARRIERS,
  detectCarrier,
  getAdminOrder,
  isCarrierId,
  markTrackingEmailed,
  saveOrderTracking,
  trackingUrl,
  type CarrierId,
} from "@/lib/orders";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
  if (!isAdminSession()) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const orderId = params.id;
  if (!orderId.startsWith("pi_")) {
    return NextResponse.json({ error: "Unknown order id." }, { status: 400 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    trackingNumber?: unknown;
    carrier?: unknown;
  };
  const trackingNumber =
    typeof body.trackingNumber === "string" ? body.trackingNumber.trim() : "";
  if (trackingNumber.length < 4 || trackingNumber.length > 60) {
    return NextResponse.json(
      { error: "Enter a valid tracking number." },
      { status: 400 },
    );
  }
  const carrier: CarrierId = isCarrierId(body.carrier)
    ? body.carrier
    : detectCarrier(trackingNumber);

  try {
    const order = await getAdminOrder(orderId);
    if (!order) {
      return NextResponse.json(
        { error: "That order is not a paid order." },
        { status: 404 },
      );
    }

    await saveOrderTracking(orderId, trackingNumber, carrier);

    let emailedAt: string | undefined;
    let emailError: string | undefined;
    if (order.email) {
      try {
        const origin =
          process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ||
          new URL(request.url).origin;
        await sendTrackingEmail({
          to: order.email,
          orderId: order.id,
          customerName: order.shipping?.name,
          trackingNumber,
          carrierLabel: CARRIERS[carrier].label,
          trackingUrl: trackingUrl(carrier, trackingNumber),
          statusUrl: `${origin}/order/${order.id}`,
          items: order.items,
        });
        emailedAt = new Date().toISOString();
        await markTrackingEmailed(orderId, emailedAt);
      } catch (err) {
        // The tracking number is saved even when the email fails; surface the
        // failure so the admin can retry instead of silently skipping it.
        console.error("Tracking email failed.", err);
        emailError =
          err instanceof Error ? err.message : "The email could not be sent.";
      }
    } else {
      emailError = "This order has no customer email on file.";
    }

    return NextResponse.json({
      order: {
        ...order,
        tracking: { number: trackingNumber, carrier, emailedAt },
      },
      emailSent: Boolean(emailedAt),
      emailError,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Could not update tracking.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
