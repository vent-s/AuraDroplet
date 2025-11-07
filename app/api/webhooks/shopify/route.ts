import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";

function verifyWebhook(secret: string, req: NextRequest, rawBody: string): boolean {
  const hmac = req.headers.get("x-shopify-hmac-sha256") ?? "";
  const digest = crypto.createHmac("sha256", secret).update(rawBody, "utf8").digest("base64");

  if (!hmac || digest.length !== hmac.length) {
    return false;
  }

  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(hmac));
}

export async function POST(req: NextRequest) {
  const secret = process.env.SHOPIFY_WEBHOOK_SECRET;

  if (!secret) {
    return NextResponse.json({ ok: false, error: "Webhook secret not configured" }, { status: 500 });
  }

  const rawBody = await req.text();

  if (!verifyWebhook(secret, req, rawBody)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const topic = req.headers.get("x-shopify-topic") ?? "unknown";
  const shopDomain = req.headers.get("x-shopify-shop-domain") ?? "unknown";
  const payload = JSON.parse(rawBody);

  // Example placeholder: extend with CRM/analytics integrations.
  console.info("Shopify webhook received", { topic, shopDomain });

  switch (topic) {
    case "orders/create":
      // Insert order handling logic here.
      break;
    case "inventory_levels/update":
      // Insert inventory sync logic here.
      break;
    default:
      break;
  }

  return NextResponse.json({ ok: true });
}
