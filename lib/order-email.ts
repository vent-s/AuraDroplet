import type { CompletedOrder, CompletedOrderItem } from "./stripe-direct";

const DEFAULT_NOTIFICATION_EMAIL = "talaliggy15@gmail.com";

function formatMoney(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount / 100);
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function orderLines(items: CompletedOrderItem[], currency: string): string[] {
  return items.length
    ? items.map((item) => {
        const quantity = Math.max(1, Math.round(item.quantity));
        const total =
          typeof item.lineTotal === "number"
            ? ` - ${formatMoney(item.lineTotal, currency)}`
            : "";
        return `${quantity} x ${item.name}${total}`;
      })
    : ["Order details are available in Stripe."];
}

async function sendEmail({
  to,
  subject,
  text,
  html,
}: {
  to: string;
  subject: string;
  text: string;
  html: string;
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.ORDER_EMAIL_FROM;
  if (!apiKey || !from) {
    throw new Error(
      "Order email is not configured. Set RESEND_API_KEY and ORDER_EMAIL_FROM.",
    );
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({ from, to, subject, text, html }),
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Resend email failed (${response.status}): ${body}`);
  }
}

export interface TrackingEmailInput {
  to: string;
  orderId: string;
  customerName?: string;
  trackingNumber: string;
  carrierLabel: string;
  trackingUrl?: string;
  items: CompletedOrderItem[];
}

/** Tells the customer their order shipped, with the tracking number. */
export async function sendTrackingEmail(input: TrackingEmailInput): Promise<void> {
  const firstName = input.customerName?.trim().split(/\s+/)[0];
  const greeting = firstName ? `Hi ${firstName},` : "Hi there,";
  const itemLines = input.items.length
    ? input.items.map(
        (item) => `${Math.max(1, Math.round(item.quantity))} x ${item.name}`,
      )
    : [];

  const text = [
    greeting,
    "",
    "Good news - your order is on its way.",
    "",
    `Carrier: ${input.carrierLabel}`,
    `Tracking number: ${input.trackingNumber}`,
    ...(input.trackingUrl ? ["", `Track your package: ${input.trackingUrl}`] : []),
    ...(itemLines.length ? ["", "Your order:", ...itemLines.map((l) => `- ${l}`)] : []),
    "",
    `Order reference: ${input.orderId}`,
    "",
    "Questions? Just reply to this email.",
  ].join("\n");

  const itemsMarkup = itemLines.length
    ? `<tr><td style="padding:0 40px 8px;">
        <p style="margin:0 0 8px;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:#b08968;">Your order</p>
        ${itemLines
          .map(
            (line) =>
              `<p style="margin:0 0 4px;font-size:15px;color:#5d4a3a;">${escapeHtml(line)}</p>`,
          )
          .join("")}
      </td></tr>`
    : "";

  const buttonMarkup = input.trackingUrl
    ? `<tr><td align="center" style="padding:8px 40px 32px;">
        <a href="${escapeHtml(input.trackingUrl)}"
           style="display:inline-block;background:#7f5539;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;letter-spacing:0.04em;padding:14px 36px;border-radius:999px;">
          Track your package
        </a>
      </td></tr>`
    : "";

  const html = `
  <div style="margin:0;padding:32px 16px;background:#ede0d4;font-family:Georgia,'Times New Roman',serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;">
      <tr><td align="center" style="padding:0 0 24px;">
        <p style="margin:0;font-size:22px;letter-spacing:0.3em;color:#7f5539;text-transform:uppercase;">Satielle</p>
      </td></tr>
      <tr><td style="background:#fffdfa;border-radius:16px;box-shadow:0 14px 40px rgba(127,85,57,0.10);">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr><td align="center" style="padding:40px 40px 8px;">
            <h1 style="margin:0;font-size:26px;font-weight:normal;color:#7f5539;">Your order is on its way</h1>
          </td></tr>
          <tr><td style="padding:16px 40px 24px;">
            <p style="margin:0 0 12px;font-size:15px;line-height:1.7;color:#5d4a3a;">${escapeHtml(greeting)}</p>
            <p style="margin:0;font-size:15px;line-height:1.7;color:#5d4a3a;">Good news &mdash; your order has shipped. You can follow it with the tracking details below.</p>
          </td></tr>
          <tr><td style="padding:0 40px 28px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#faf4ec;border:1px dashed #ddb892;border-radius:12px;">
              <tr><td align="center" style="padding:22px 16px;">
                <p style="margin:0 0 6px;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:#b08968;">${escapeHtml(input.carrierLabel)} tracking number</p>
                <p style="margin:0;font-size:20px;letter-spacing:0.06em;color:#7f5539;font-weight:bold;">${escapeHtml(input.trackingNumber)}</p>
              </td></tr>
            </table>
          </td></tr>
          ${buttonMarkup}
          ${itemsMarkup}
          <tr><td style="padding:8px 40px 36px;">
            <p style="margin:0;font-size:13px;line-height:1.7;color:#9c8570;">Order reference ${escapeHtml(input.orderId)}<br />Questions? Just reply to this email &mdash; we're happy to help.</p>
          </td></tr>
        </table>
      </td></tr>
      <tr><td align="center" style="padding:24px 0 0;">
        <p style="margin:0;font-size:12px;color:#b08968;">Thank you for choosing Satielle.</p>
      </td></tr>
    </table>
  </div>`;

  await sendEmail({
    to: input.to,
    subject: `Your order is on the way · Tracking ${input.trackingNumber}`,
    text,
    html,
  });
}

/**
 * Delivers the business notification after a payment completes. Stripe sends
 * the customer receipt through the PaymentIntent's receipt_email field.
 */
export async function sendCompletedOrderNotification(
  order: CompletedOrder,
): Promise<void> {
  const recipient =
    process.env.ORDER_NOTIFICATION_EMAIL || DEFAULT_NOTIFICATION_EMAIL;
  const lines = orderLines(order.items, order.currency);
  const total = formatMoney(order.amount, order.currency);
  const source = order.source ? ` from ${order.source}` : "";
  const customer = order.customerEmail || "not provided";
  const text = [
    `New paid order${source}`,
    `Order: ${order.orderId}`,
    `Customer: ${customer}`,
    "",
    "Items:",
    ...lines.map((line) => `- ${line}`),
    "",
    `Total: ${total}`,
  ].join("\n");
  const itemMarkup = lines
    .map((line) => `<li>${escapeHtml(line)}</li>`)
    .join("");
  const html = `<h1>New paid order${escapeHtml(source)}</h1><p><strong>Order:</strong> ${escapeHtml(order.orderId)}<br /><strong>Customer:</strong> ${escapeHtml(customer)}</p><h2>Items</h2><ul>${itemMarkup}</ul><p><strong>Total:</strong> ${escapeHtml(total)}</p>`;

  await sendEmail({
    to: recipient,
    subject: `New order ${order.orderId}`,
    text,
    html,
  });
}
