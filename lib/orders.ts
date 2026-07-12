// Admin order reads and tracking writes. Stripe is the order database: every
// paid checkout is a succeeded PaymentIntent carrying the customer email,
// shipping address, and item metadata, and the fulfillment tracking number is
// stored back onto the PaymentIntent's metadata so no separate store exists.

import {
  fetchLiveTracking,
  isLiveTrackingConfigured,
  type LiveTrackingStatus,
  type TrackingStage,
} from "./carrier-tracking";
import type { CompletedOrderItem } from "./stripe-direct";

export type CarrierId = "usps" | "ups" | "fedex" | "dhl" | "other";

export const CARRIERS: Record<CarrierId, { label: string }> = {
  usps: { label: "USPS" },
  ups: { label: "UPS" },
  fedex: { label: "FedEx" },
  dhl: { label: "DHL" },
  other: { label: "Other" },
};

export function isCarrierId(value: unknown): value is CarrierId {
  return typeof value === "string" && value in CARRIERS;
}

export function detectCarrier(trackingNumber: string): CarrierId {
  const normalized = trackingNumber.replace(/\s+/g, "");
  if (/^1Z/i.test(normalized)) return "ups";
  if (/^9\d{19,25}$/.test(normalized)) return "usps";
  if (/^(\d{12}|\d{15})$/.test(normalized)) return "fedex";
  if (/^\d{10}$/.test(normalized)) return "dhl";
  return "other";
}

export function trackingUrl(
  carrier: CarrierId,
  trackingNumber: string,
): string | undefined {
  const encoded = encodeURIComponent(trackingNumber.trim());
  switch (carrier) {
    case "usps":
      return `https://tools.usps.com/go/TrackConfirmAction?tLabels=${encoded}`;
    case "ups":
      return `https://www.ups.com/track?tracknum=${encoded}`;
    case "fedex":
      return `https://www.fedex.com/fedextrack/?trknbr=${encoded}`;
    case "dhl":
      return `https://www.dhl.com/us-en/home/tracking.html?tracking-id=${encoded}`;
    default:
      return undefined;
  }
}

export interface AdminOrderShipping {
  name?: string;
  phone?: string;
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

export interface AdminOrderTracking {
  number: string;
  carrier: CarrierId;
  emailedAt?: string;
  stage?: TrackingStage;
  stageSummary?: string;
  stageAt?: string;
  checkedAt?: string;
  location?: string;
  etaDate?: string;
}

export interface AdminOrder {
  id: string;
  created: number; // unix seconds
  amount: number; // integer cents
  currency: string;
  status: "succeeded" | "processing";
  email?: string;
  source?: string;
  affiliate?: string;
  items: CompletedOrderItem[];
  shipping?: AdminOrderShipping;
  tracking?: AdminOrderTracking;
}

interface StripePaymentIntent {
  id: string;
  object: string;
  status: string;
  amount: number;
  currency: string;
  created: number;
  receipt_email?: string | null;
  metadata?: Record<string, string>;
  shipping?: {
    name?: string | null;
    phone?: string | null;
    address?: {
      line1?: string | null;
      line2?: string | null;
      city?: string | null;
      state?: string | null;
      postal_code?: string | null;
      country?: string | null;
    } | null;
  } | null;
}

function secretKey(): string {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("Missing STRIPE_SECRET_KEY for the admin order list.");
  }
  return key;
}

async function stripe<T>(
  path: string,
  options?: {
    query?: Record<string, string | number>;
    body?: Record<string, string | number>;
  },
): Promise<T> {
  const query = options?.query
    ? `?${new URLSearchParams(
        Object.fromEntries(
          Object.entries(options.query).map(([k, v]) => [k, String(v)]),
        ),
      )}`
    : "";

  const response = await fetch(`https://api.stripe.com/v1${path}${query}`, {
    method: options?.body ? "POST" : "GET",
    headers: {
      authorization: `Bearer ${secretKey()}`,
      ...(options?.body
        ? { "content-type": "application/x-www-form-urlencoded" }
        : {}),
    },
    body: options?.body
      ? new URLSearchParams(
          Object.fromEntries(
            Object.entries(options.body).map(([k, v]) => [k, String(v)]),
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

function parseItems(metadata: Record<string, string> | undefined): CompletedOrderItem[] {
  try {
    const raw = JSON.parse(metadata?.items ?? "[]") as Array<{
      name?: unknown;
      quantity?: unknown;
      lineTotal?: unknown;
    }>;
    return raw
      .filter((item) => typeof item.name === "string")
      .map((item) => ({
        name: item.name as string,
        quantity: Number(item.quantity) || 1,
        lineTotal: Number.isFinite(Number(item.lineTotal))
          ? Number(item.lineTotal)
          : undefined,
      }));
  } catch {
    return [];
  }
}

function toAdminOrder(intent: StripePaymentIntent): AdminOrder | null {
  if (intent.status !== "succeeded" && intent.status !== "processing") {
    return null;
  }

  const metadata = intent.metadata ?? {};
  const address = intent.shipping?.address;
  const shipping =
    intent.shipping?.name || address?.line1
      ? {
          name: intent.shipping?.name ?? undefined,
          phone: intent.shipping?.phone ?? undefined,
          line1: address?.line1 ?? undefined,
          line2: address?.line2 ?? undefined,
          city: address?.city ?? undefined,
          state: address?.state ?? undefined,
          postalCode: address?.postal_code ?? undefined,
          country: address?.country ?? undefined,
        }
      : undefined;

  const STAGES: TrackingStage[] = [
    "label_created",
    "in_transit",
    "out_for_delivery",
    "delivered",
    "exception",
  ];
  const cachedStage = STAGES.find((s) => s === metadata.tracking_stage);

  const trackingNumber = metadata.tracking_number?.trim();
  const tracking = trackingNumber
    ? {
        number: trackingNumber,
        carrier: isCarrierId(metadata.tracking_carrier)
          ? metadata.tracking_carrier
          : detectCarrier(trackingNumber),
        emailedAt: metadata.tracking_emailed_at || undefined,
        stage: cachedStage,
        stageSummary: metadata.tracking_stage_summary || undefined,
        stageAt: metadata.tracking_stage_at || undefined,
        checkedAt: metadata.tracking_checked_at || undefined,
        location: metadata.tracking_location || undefined,
        etaDate: metadata.tracking_eta || undefined,
      }
    : undefined;

  return {
    id: intent.id,
    created: intent.created,
    amount: intent.amount,
    currency: intent.currency,
    status: intent.status,
    email: intent.receipt_email ?? undefined,
    source: metadata.source || undefined,
    affiliate: metadata.affiliate || undefined,
    items: parseItems(metadata),
    shipping,
    tracking,
  };
}

/** Lists paid orders, newest first, straight from Stripe PaymentIntents. */
export async function listAdminOrders(): Promise<AdminOrder[]> {
  const { data } = await stripe<{ data: StripePaymentIntent[] }>(
    "/payment_intents",
    { query: { limit: 100 } },
  );
  return data
    .map(toAdminOrder)
    .filter((order): order is AdminOrder => order !== null);
}

export async function getAdminOrder(id: string): Promise<AdminOrder | null> {
  const intent = await stripe<StripePaymentIntent>(
    `/payment_intents/${encodeURIComponent(id)}`,
  );
  return toAdminOrder(intent);
}

export async function saveOrderTracking(
  id: string,
  trackingNumber: string,
  carrier: CarrierId,
): Promise<void> {
  await stripe(`/payment_intents/${encodeURIComponent(id)}`, {
    body: {
      "metadata[tracking_number]": trackingNumber,
      "metadata[tracking_carrier]": carrier,
      // An empty value deletes the key, clearing any stale live-status cache
      // from a previously saved tracking number.
      "metadata[tracking_stage]": "",
      "metadata[tracking_stage_summary]": "",
      "metadata[tracking_stage_at]": "",
      "metadata[tracking_checked_at]": "",
      "metadata[tracking_location]": "",
      "metadata[tracking_eta]": "",
    },
  });
}

export async function markTrackingEmailed(
  id: string,
  emailedAt: string,
): Promise<void> {
  await stripe(`/payment_intents/${encodeURIComponent(id)}`, {
    body: { "metadata[tracking_emailed_at]": emailedAt },
  });
}

export async function saveTrackingStage(
  id: string,
  status: LiveTrackingStatus | null,
  checkedAt: string,
): Promise<void> {
  await stripe(`/payment_intents/${encodeURIComponent(id)}`, {
    body: {
      "metadata[tracking_checked_at]": checkedAt,
      ...(status
        ? {
            "metadata[tracking_stage]": status.stage,
            "metadata[tracking_stage_summary]": status.summary.slice(0, 480),
            "metadata[tracking_stage_at]": status.eventAt ?? "",
            "metadata[tracking_location]": status.location?.slice(0, 480) ?? "",
            "metadata[tracking_eta]": status.etaDate ?? "",
          }
        : {}),
    },
  });
}

const LIVE_REFRESH_MS = 15 * 60 * 1000;

/**
 * Loads an order and, at most once per 15 minutes, refreshes its live carrier
 * status into the PaymentIntent's metadata. Carrier failures fall back to the
 * cached stage so the customer page never breaks because a carrier is down.
 */
export async function getOrderWithLiveTracking(
  id: string,
): Promise<AdminOrder | null> {
  const order = await getAdminOrder(id);
  const tracking = order?.tracking;
  if (!order || !tracking) return order;
  if (tracking.stage === "delivered") return order;
  if (!isLiveTrackingConfigured(tracking.carrier)) return order;
  if (
    tracking.checkedAt &&
    Date.now() - Date.parse(tracking.checkedAt) < LIVE_REFRESH_MS
  ) {
    return order;
  }

  const checkedAt = new Date().toISOString();
  try {
    const live = await fetchLiveTracking(tracking.carrier, tracking.number);
    await saveTrackingStage(id, live, checkedAt);
    if (live) {
      order.tracking = {
        ...tracking,
        stage: live.stage,
        stageSummary: live.summary,
        stageAt: live.eventAt,
        location: live.location,
        etaDate: live.etaDate,
        checkedAt,
      };
    } else {
      order.tracking = { ...tracking, checkedAt };
    }
  } catch (err) {
    console.error("Live tracking refresh failed.", err);
  }
  return order;
}
