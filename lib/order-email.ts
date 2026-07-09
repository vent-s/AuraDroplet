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

// Customer emails share the navy/gold look of the /order status page.
const NAVY = "#0a2f6b";
const NAVY_DEEP = "#082554";
const GOLD = "#d4a72c";
const GOLD_LIGHT = "#e7c667";
const INK_SOFT = "#5b6b85";
const PAGE_BG = "#f6f8fb";

function greetingFor(customerName?: string): string {
  const firstName = customerName?.trim().split(/\s+/)[0];
  return firstName ? `Hi ${firstName},` : "Hi there,";
}

function itemLinesFor(items: CompletedOrderItem[]): string[] {
  return items.map(
    (item) => `${Math.max(1, Math.round(item.quantity))} x ${item.name}`,
  );
}

function itemsSectionMarkup(itemLines: string[]): string {
  if (!itemLines.length) return "";
  return `<tr><td style="padding:0 40px 8px;">
      <p style="margin:0 0 8px;font-size:12px;letter-spacing:0.16em;text-transform:uppercase;color:${INK_SOFT};font-weight:bold;">Your order</p>
      ${itemLines
        .map(
          (line) =>
            `<p style="margin:0 0 4px;font-size:15px;color:${NAVY};">${escapeHtml(line)}</p>`,
        )
        .join("")}
    </td></tr>`;
}

function goldButtonMarkup(href: string, label: string): string {
  return `<tr><td align="center" style="padding:8px 40px 32px;">
      <a href="${escapeHtml(href)}"
         style="display:inline-block;background:${GOLD};color:${NAVY_DEEP};text-decoration:none;font-size:15px;font-weight:bold;letter-spacing:0.04em;padding:14px 40px;border-radius:999px;">
        ${escapeHtml(label)}
      </a>
    </td></tr>`;
}

function customerEmailShell(badge: string, innerRows: string): string {
  return `
  <div style="margin:0;padding:32px 16px;background:${PAGE_BG};font-family:-apple-system,'Segoe UI',Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;">
      <tr><td align="center" style="padding:0 0 24px;">
        <p style="margin:0;font-size:20px;letter-spacing:0.3em;color:${NAVY};text-transform:uppercase;font-weight:bold;">Satielle</p>
      </td></tr>
      <tr><td style="background:#ffffff;border-radius:16px;border:1px solid rgba(10,47,107,0.08);box-shadow:0 24px 60px rgba(10,47,107,0.09);">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr><td align="center" style="padding:36px 40px 0;">
            <span style="display:inline-block;background:${GOLD};color:${NAVY_DEEP};font-size:11px;font-weight:bold;letter-spacing:0.16em;text-transform:uppercase;padding:6px 16px;border-radius:999px;">${escapeHtml(badge)}</span>
          </td></tr>
          ${innerRows}
        </table>
      </td></tr>
      <tr><td align="center" style="padding:24px 0 0;">
        <p style="margin:0;font-size:12px;color:${INK_SOFT};">Thank you for choosing Satielle.</p>
      </td></tr>
    </table>
  </div>`;
}

function footerRowMarkup(orderId: string, statusUrl?: string): string {
  const statusLink = statusUrl
    ? `<a href="${escapeHtml(statusUrl)}" style="color:${NAVY};font-weight:bold;text-decoration:underline;">Check your order status</a> any time.<br />`
    : "";
  return `<tr><td style="padding:8px 40px 36px;">
      <p style="margin:0;font-size:13px;line-height:1.8;color:${INK_SOFT};">${statusLink}Order reference ${escapeHtml(orderId)}<br />Questions? Just reply to this email &mdash; we're happy to help.</p>
    </td></tr>`;
}

export interface ConfirmationEmailInput {
  to: string;
  orderId: string;
  statusUrl: string;
  customerName?: string;
  amount: number; // integer cents
  currency: string;
  items: CompletedOrderItem[];
}

/** Tells the customer their order is being processed, with a status link. */
export async function sendOrderConfirmationEmail(
  input: ConfirmationEmailInput,
): Promise<void> {
  const greeting = greetingFor(input.customerName);
  const itemLines = itemLinesFor(input.items);
  const total = formatMoney(input.amount, input.currency);

  const text = [
    greeting,
    "",
    "We are processing your order. Your payment is confirmed and our team is preparing everything for shipment.",
    "",
    `Check your order status any time: ${input.statusUrl}`,
    ...(itemLines.length
      ? ["", "Your order:", ...itemLines.map((l) => `- ${l}`)]
      : []),
    `Total: ${total}`,
    "",
    `Order reference: ${input.orderId}`,
    "",
    "You'll get another email with a tracking number as soon as it ships.",
    "Questions? Just reply to this email.",
  ].join("\n");

  const html = customerEmailShell(
    "Processing",
    `<tr><td align="center" style="padding:18px 40px 8px;">
        <h1 style="margin:0;font-size:26px;font-weight:800;color:${NAVY};">We are processing your order</h1>
      </td></tr>
      <tr><td style="padding:12px 40px 24px;">
        <p style="margin:0 0 12px;font-size:15px;line-height:1.7;color:${INK_SOFT};">${escapeHtml(greeting)}</p>
        <p style="margin:0;font-size:15px;line-height:1.7;color:${INK_SOFT};">Your payment is confirmed and our team is preparing your order for shipment. You'll get another email with a tracking number the moment it ships.</p>
      </td></tr>
      ${goldButtonMarkup(input.statusUrl, "Check your order status")}
      ${itemsSectionMarkup(itemLines)}
      <tr><td style="padding:4px 40px 20px;">
        <p style="margin:0;font-size:15px;color:${NAVY};font-weight:bold;">Total: ${escapeHtml(total)}</p>
      </td></tr>
      ${footerRowMarkup(input.orderId)}`,
  );

  await sendEmail({
    to: input.to,
    subject: "We are processing your order",
    text,
    html,
  });
}

export interface TrackingEmailInput {
  to: string;
  orderId: string;
  customerName?: string;
  trackingNumber: string;
  carrierLabel: string;
  trackingUrl?: string;
  statusUrl?: string;
  items: CompletedOrderItem[];
}

/** Tells the customer their order shipped, with the tracking number. */
export async function sendTrackingEmail(input: TrackingEmailInput): Promise<void> {
  const greeting = greetingFor(input.customerName);
  const itemLines = itemLinesFor(input.items);

  const text = [
    greeting,
    "",
    "Good news - your order is on its way.",
    "",
    `Carrier: ${input.carrierLabel}`,
    `Tracking number: ${input.trackingNumber}`,
    ...(input.trackingUrl ? ["", `Track your package: ${input.trackingUrl}`] : []),
    ...(input.statusUrl ? [`Check your order status: ${input.statusUrl}`] : []),
    ...(itemLines.length ? ["", "Your order:", ...itemLines.map((l) => `- ${l}`)] : []),
    "",
    `Order reference: ${input.orderId}`,
    "",
    "Questions? Just reply to this email.",
  ].join("\n");

  const html = customerEmailShell(
    "Shipped",
    `<tr><td align="center" style="padding:18px 40px 8px;">
        <h1 style="margin:0;font-size:26px;font-weight:800;color:${NAVY};">Your order is on its way</h1>
      </td></tr>
      <tr><td style="padding:12px 40px 24px;">
        <p style="margin:0 0 12px;font-size:15px;line-height:1.7;color:${INK_SOFT};">${escapeHtml(greeting)}</p>
        <p style="margin:0;font-size:15px;line-height:1.7;color:${INK_SOFT};">Good news &mdash; your order has shipped. You can follow it with the tracking details below.</p>
      </td></tr>
      <tr><td style="padding:0 40px 28px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${NAVY};border-radius:12px;">
          <tr><td align="center" style="padding:22px 16px;">
            <p style="margin:0 0 6px;font-size:12px;letter-spacing:0.16em;text-transform:uppercase;color:${GOLD_LIGHT};font-weight:bold;">${escapeHtml(input.carrierLabel)} tracking number</p>
            <p style="margin:0;font-size:20px;letter-spacing:0.06em;color:#ffffff;font-weight:bold;word-break:break-all;">${escapeHtml(input.trackingNumber)}</p>
          </td></tr>
        </table>
      </td></tr>
      ${input.trackingUrl ? goldButtonMarkup(input.trackingUrl, "Track your package") : ""}
      ${itemsSectionMarkup(itemLines)}
      ${footerRowMarkup(input.orderId, input.statusUrl)}`,
  );

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
