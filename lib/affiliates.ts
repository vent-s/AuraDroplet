// Affiliate click stats live on the WordPress storefront (NovaLife Affiliates
// plugin); conversions live here in Stripe PaymentIntent metadata. The WP
// stats endpoint authenticates with the same shared secret the storefront
// uses for checkout handoffs, so no extra configuration is needed.

export interface AffiliateClickStats {
  code: string;
  name: string;
  created: string;
  link: string;
  clicks_total: number;
  clicks_30d: number;
  last_click: string | null;
}

export interface AffiliateDailyClicks {
  code: string;
  day: string; // YYYY-MM-DD (UTC)
  clicks: number;
}

export interface AffiliateStats {
  affiliates: AffiliateClickStats[];
  daily: AffiliateDailyClicks[];
  generated_at: string;
}

const STOREFRONT_URL =
  process.env.AFFILIATE_STATS_URL ||
  "https://novalife.science/wp-json/novalife/v1/affiliate-stats";

export async function fetchAffiliateStats(): Promise<AffiliateStats> {
  const secret = process.env.CHECKOUT_HANDOFF_SECRET;
  if (!secret) {
    throw new Error(
      "Missing CHECKOUT_HANDOFF_SECRET — it authenticates the affiliate stats feed.",
    );
  }

  const response = await fetch(STOREFRONT_URL, {
    headers: { authorization: `Bearer ${secret}` },
    cache: "no-store",
  });
  const body = (await response.json().catch(() => ({}))) as AffiliateStats & {
    message?: string;
  };
  if (!response.ok) {
    throw new Error(body.message || "Could not load affiliate click stats.");
  }

  return {
    affiliates: Array.isArray(body.affiliates) ? body.affiliates : [],
    daily: Array.isArray(body.daily) ? body.daily : [],
    generated_at: body.generated_at ?? new Date().toISOString(),
  };
}
