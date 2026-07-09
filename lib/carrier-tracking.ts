// Live tracking statuses straight from the carriers' free APIs (UPS + USPS).
// OAuth tokens are cached in-module; callers cache statuses on the Stripe
// PaymentIntent so customer page views rarely reach the carrier at all.

import type { CarrierId } from "./orders";

export type TrackingStage =
  | "label_created"
  | "in_transit"
  | "out_for_delivery"
  | "delivered"
  | "exception";

export interface LiveTrackingStatus {
  stage: TrackingStage;
  summary: string;
  eventAt?: string; // ISO timestamp of the carrier's latest scan
}

export function isLiveTrackingConfigured(carrier: CarrierId): boolean {
  if (carrier === "ups") {
    return Boolean(process.env.UPS_CLIENT_ID && process.env.UPS_CLIENT_SECRET);
  }
  if (carrier === "usps") {
    return Boolean(
      process.env.USPS_CLIENT_ID && process.env.USPS_CLIENT_SECRET,
    );
  }
  return false;
}

interface CachedToken {
  token: string;
  expiresAt: number;
}

let upsToken: CachedToken | null = null;
let uspsToken: CachedToken | null = null;

async function oauthToken(
  url: string,
  headers: Record<string, string>,
  body: URLSearchParams,
  label: string,
): Promise<CachedToken> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded", ...headers },
    body,
    cache: "no-store",
  });
  const data = (await response.json().catch(() => ({}))) as {
    access_token?: string;
    expires_in?: number | string;
  };
  if (!response.ok || !data.access_token) {
    throw new Error(`${label} authentication failed (${response.status}).`);
  }
  return {
    token: data.access_token,
    // Refresh a minute early so a token never expires mid-request.
    expiresAt: Date.now() + (Number(data.expires_in) || 3600) * 1000 - 60_000,
  };
}

async function upsAccessToken(): Promise<string> {
  if (upsToken && upsToken.expiresAt > Date.now()) return upsToken.token;
  const credentials = Buffer.from(
    `${process.env.UPS_CLIENT_ID}:${process.env.UPS_CLIENT_SECRET}`,
  ).toString("base64");
  upsToken = await oauthToken(
    "https://onlinetools.ups.com/security/v1/oauth/token",
    { authorization: `Basic ${credentials}` },
    new URLSearchParams({ grant_type: "client_credentials" }),
    "UPS",
  );
  return upsToken.token;
}

async function uspsAccessToken(): Promise<string> {
  if (uspsToken && uspsToken.expiresAt > Date.now()) return uspsToken.token;
  uspsToken = await oauthToken(
    "https://apis.usps.com/oauth2/v3/token",
    {},
    new URLSearchParams({
      grant_type: "client_credentials",
      client_id: process.env.USPS_CLIENT_ID ?? "",
      client_secret: process.env.USPS_CLIENT_SECRET ?? "",
    }),
    "USPS",
  );
  return uspsToken.token;
}

function upsStage(statusType: string, description: string): TrackingStage {
  if (/out for delivery/i.test(description)) return "out_for_delivery";
  switch (statusType.toUpperCase()) {
    case "D":
      return "delivered";
    case "X":
    case "RS":
      return "exception";
    case "M":
    case "MV":
      return "label_created";
    default:
      return "in_transit";
  }
}

function upsEventDate(date?: string, time?: string): string | undefined {
  // UPS formats activity timestamps as date "YYYYMMDD" and time "HHMMSS".
  const match = /^(\d{4})(\d{2})(\d{2})$/.exec(date ?? "");
  if (!match) return undefined;
  const t = /^(\d{2})(\d{2})(\d{2})$/.exec(time ?? "");
  return `${match[1]}-${match[2]}-${match[3]}T${t ? `${t[1]}:${t[2]}:${t[3]}` : "00:00:00"}`;
}

/** Returns the latest UPS status, or null if UPS doesn't know the number. */
async function trackUps(
  trackingNumber: string,
): Promise<LiveTrackingStatus | null> {
  const token = await upsAccessToken();
  const response = await fetch(
    `https://onlinetools.ups.com/api/track/v1/details/${encodeURIComponent(trackingNumber)}?locale=en_US&returnSignature=false`,
    {
      headers: {
        authorization: `Bearer ${token}`,
        transId: crypto.randomUUID(),
        transactionSrc: "satielle",
      },
      cache: "no-store",
    },
  );
  if (response.status === 404 || response.status === 400) return null;
  if (!response.ok) {
    throw new Error(`UPS tracking lookup failed (${response.status}).`);
  }

  const data = (await response.json()) as {
    trackResponse?: {
      shipment?: Array<{
        package?: Array<{
          activity?: Array<{
            status?: { type?: string; description?: string };
            date?: string;
            time?: string;
          }>;
        }>;
        warnings?: Array<{ message?: string }>;
      }>;
    };
  };
  const activity =
    data.trackResponse?.shipment?.[0]?.package?.[0]?.activity?.[0];
  const description = activity?.status?.description?.trim();
  if (!activity || !description) return null;

  return {
    stage: upsStage(activity.status?.type ?? "", description),
    summary: description,
    eventAt: upsEventDate(activity.date, activity.time),
  };
}

function uspsStage(statusCategory: string): TrackingStage {
  const category = statusCategory.toLowerCase();
  if (category.includes("delivered")) return "delivered";
  if (category.includes("out for delivery")) return "out_for_delivery";
  if (category.includes("pre-shipment")) return "label_created";
  if (category.includes("alert") || category.includes("attempt")) {
    return "exception";
  }
  return "in_transit";
}

/** Returns the latest USPS status, or null if USPS doesn't know the number. */
async function trackUsps(
  trackingNumber: string,
): Promise<LiveTrackingStatus | null> {
  const token = await uspsAccessToken();
  const response = await fetch(
    `https://apis.usps.com/tracking/v3/tracking/${encodeURIComponent(trackingNumber)}?expand=SUMMARY`,
    {
      headers: { authorization: `Bearer ${token}` },
      cache: "no-store",
    },
  );
  if (response.status === 404 || response.status === 400) return null;
  if (!response.ok) {
    throw new Error(`USPS tracking lookup failed (${response.status}).`);
  }

  const data = (await response.json()) as {
    statusCategory?: string;
    status?: string;
    statusSummary?: string;
    eventSummaries?: string[];
  };
  const category = data.statusCategory ?? data.status;
  if (!category) return null;

  return {
    stage: uspsStage(category),
    summary:
      data.statusSummary?.trim() ||
      data.eventSummaries?.[0]?.trim() ||
      category,
  };
}

/**
 * Fetches the live status for a shipment. Returns null when the carrier does
 * not recognize the number (typo, or a label created moments ago); throws on
 * configuration/network failures so callers can fall back to cached data.
 */
export async function fetchLiveTracking(
  carrier: CarrierId,
  trackingNumber: string,
): Promise<LiveTrackingStatus | null> {
  if (!isLiveTrackingConfigured(carrier)) {
    throw new Error(`Live tracking is not configured for ${carrier}.`);
  }
  if (carrier === "ups") return trackUps(trackingNumber);
  if (carrier === "usps") return trackUsps(trackingNumber);
  return null;
}
