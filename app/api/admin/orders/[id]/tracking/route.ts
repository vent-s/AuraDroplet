import { NextResponse } from "next/server";
import { isAdminSession } from "@/lib/admin-auth";
import {
  fetchLiveTracking,
  isLiveTrackingConfigured,
} from "@/lib/carrier-tracking";
import { sendTrackingEmail } from "@/lib/order-email";
import {
  CARRIERS,
  detectCarrier,
  getAdminOrder,
  isCarrierId,
  markTrackingEmailed,
  saveOrderTracking,
  saveTrackingStage,
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

    // Validate the number against the carrier's live API when configured, and
    // seed the status cache the customer /order page reads.
    let trackingWarning: string | undefined;
    if (isLiveTrackingConfigured(carrier)) {
      try {
        const live = await fetchLiveTracking(carrier, trackingNumber);
        await saveTrackingStage(orderId, live, new Date().toISOString());
        if (!live) {
          trackingWarning = `${CARRIERS[carrier].label} doesn't recognize this number yet. That's normal within a few hours of creating a label — but double-check it for typos.`;
        }
      } catch (err) {
        console.error("Carrier validation failed.", err);
      }
    }

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
      trackingWarning,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Could not update tracking.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
