// Direct Stripe payments for cart-style handoffs (e.g. novalife.science).
// Those carts have no Medusa products, so instead of building a Medusa cart
// we create a PaymentIntent for the handoff's total and reuse the existing
// Stripe Elements checkout page. Requires STRIPE_SECRET_KEY.

import type { CheckoutHandoff } from "./checkout-handoff";

export interface DirectPaymentSession {
  paymentIntentId: string;
  clientSecret: string;
  amount: number; // integer cents
  currency: string;
}

export interface CompletedOrderItem {
  name: string;
  quantity: number;
  lineTotal?: number; // integer cents
}

export interface CompletedOrder {
  orderId: string;
  customerEmail?: string;
  amount: number; // integer cents
  currency: string;
  source?: string;
  items: CompletedOrderItem[];
}

export function isDirectPaymentId(cartId: string): boolean {
  return cartId.startsWith("pi_");
}

function secretKey(): string {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("Missing STRIPE_SECRET_KEY for direct cart checkout.");
  }
  return key;
}

function paymentIntentIdFromClientSecret(clientSecret: string): string | null {
  const match = /^(pi_[^_]+)_secret_/.exec(clientSecret);
  return match?.[1] ?? null;
}

async function stripe<T>(
  path: string,
  params?: Record<string, string | number>,
): Promise<T> {
  const response = await fetch(`https://api.stripe.com/v1${path}`, {
    method: params ? "POST" : "GET",
    headers: {
      authorization: `Bearer ${secretKey()}`,
      ...(params
        ? { "content-type": "application/x-www-form-urlencoded" }
        : {}),
    },
    body: params
      ? new URLSearchParams(
          Object.fromEntries(
            Object.entries(params).map(([k, v]) => [k, String(v)]),
          ),
        )
      : undefined,
    cache: "no-store",
  });

  const body = (await response.json()) as T & {
    error?: { message?: string };
  };
  if (!response.ok) {
    throw new Error(body.error?.message || `Stripe ${path} failed.`);
  }
  return body;
}

export async function createDirectPayment(
  handoff: CheckoutHandoff,
): Promise<DirectPaymentSession> {
  const amount = handoff.cartTotal ?? 0;
  if (!handoff.items?.length || amount < 1) {
    throw new Error("The checkout handoff has no payable items.");
  }

  const summary = handoff.items
    .map((item) => `${item.quantity}x ${item.name}`)
    .join(", ");

  const params: Record<string, string | number> = {
    amount,
    currency: handoff.currency ?? "usd",
    description: `${handoff.source} order: ${summary}`.slice(0, 500),
    "automatic_payment_methods[enabled]": "true",
    "metadata[source]": handoff.source,
    "metadata[items]": JSON.stringify(
      handoff.items.map(({ id, name, quantity, lineTotal }) => ({
        id,
        name,
        quantity,
        lineTotal,
      })),
    ).slice(0, 500),
  };
  if (handoff.email) {
    params.receipt_email = handoff.email;
  }

  const intent = await stripe<{
    id: string;
    client_secret?: string;
    amount: number;
    currency: string;
  }>("/payment_intents", params);

  if (!intent.client_secret) {
    throw new Error("Stripe did not return a client secret.");
  }

  return {
    paymentIntentId: intent.id,
    clientSecret: intent.client_secret,
    amount: intent.amount,
    currency: intent.currency,
  };
}

/** Ensures Stripe sends its native receipt after a Medusa payment succeeds. */
export async function setStripeReceiptEmail(
  clientSecret: string,
  email: string,
): Promise<void> {
  const paymentIntentId = paymentIntentIdFromClientSecret(clientSecret);
  if (!paymentIntentId) {
    throw new Error("Stripe did not return a valid PaymentIntent client secret.");
  }

  await stripe(`/payment_intents/${paymentIntentId}`, { receipt_email: email });
}

export async function setDirectPaymentShipping(
  paymentIntentId: string,
  address: {
    first_name: string;
    last_name: string;
    address_1: string;
    address_2?: string;
    city: string;
    province?: string;
    postal_code: string;
    country_code: string;
    phone?: string;
  },
): Promise<void> {
  const params: Record<string, string | number> = {
    "shipping[name]": `${address.first_name} ${address.last_name}`.trim(),
    "shipping[address][line1]": address.address_1,
    "shipping[address][city]": address.city,
    "shipping[address][postal_code]": address.postal_code,
    "shipping[address][country]": address.country_code.toUpperCase(),
  };
  if (address.address_2) params["shipping[address][line2]"] = address.address_2;
  if (address.province) params["shipping[address][state]"] = address.province;
  if (address.phone) params["shipping[phone]"] = address.phone;

  await stripe(`/payment_intents/${paymentIntentId}`, params);
}

export async function confirmDirectPaymentSucceeded(
  paymentIntentId: string,
): Promise<CompletedOrder> {
  const intent = await stripe<{
    id: string;
    status: string;
    amount: number;
    currency: string;
    receipt_email?: string | null;
    metadata?: Record<string, string>;
  }>(
    `/payment_intents/${paymentIntentId}`,
  );
  if (intent.status !== "succeeded" && intent.status !== "processing") {
    throw new Error(`Payment is not complete (status: ${intent.status}).`);
  }

  let items: CompletedOrderItem[] = [];
  try {
    const rawItems = JSON.parse(intent.metadata?.items ?? "[]") as Array<{
      name?: unknown;
      quantity?: unknown;
      lineTotal?: unknown;
    }>;
    items = rawItems
      .filter((item) => typeof item.name === "string")
      .map((item) => ({
        name: item.name as string,
        quantity: Number(item.quantity) || 1,
        lineTotal: Number.isFinite(Number(item.lineTotal))
          ? Number(item.lineTotal)
          : undefined,
      }));
  } catch {
    // An order can still be completed if older PaymentIntent metadata is absent.
  }

  return {
    orderId: intent.id,
    customerEmail: intent.receipt_email ?? undefined,
    amount: intent.amount,
    currency: intent.currency,
    source: intent.metadata?.source,
    items,
  };
}
