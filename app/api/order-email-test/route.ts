import { timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { sendCompletedOrderNotification } from "@/lib/order-email";

function isAuthorized(request: Request, secret: string): boolean {
  const authorization = request.headers.get("authorization") ?? "";
  const supplied = authorization.replace(/^Bearer\s+/i, "");
  const expected = Buffer.from(secret);
  const actual = Buffer.from(supplied);

  return (
    actual.length === expected.length && timingSafeEqual(actual, expected)
  );
}

/** Sends a Resend-only sample order notification. It never creates a payment. */
export async function POST(request: Request) {
  const secret = process.env.ORDER_EMAIL_TEST_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "Order email test is not configured." },
      { status: 503 },
    );
  }

  if (!isAuthorized(request, secret)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const testId = `email-test-${Date.now()}`;
    await sendCompletedOrderNotification({
      orderId: testId,
      customerEmail: "test-customer@example.com",
      amount: 50,
      currency: "usd",
      source: "resend-test",
      items: [
        {
          name: "Resend order-notification test",
          quantity: 1,
          lineTotal: 50,
        },
      ],
    });
    return NextResponse.json({ ok: true, testId });
  } catch (err) {
    console.error("Order email test failed.", err);
    return NextResponse.json(
      { error: "The test email could not be sent. Check server logs." },
      { status: 502 },
    );
  }
}
