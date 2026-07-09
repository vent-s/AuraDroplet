import type { CompletedOrder, CompletedOrderItem } from "./stripe-direct";

const DEFAULT_NOTIFICATION_EMAIL = "taladiggy05@gmail.com";

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
    console.error(
      "Order email was not sent: configure RESEND_API_KEY and ORDER_EMAIL_FROM.",
    );
    return;
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
