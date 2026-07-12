"use client";

import { useEffect, useMemo, useState } from "react";

interface AffiliateClickStats {
  code: string;
  name: string;
  created: string;
  link: string;
  clicks_total: number;
  clicks_30d: number;
  last_click: string | null;
}

interface AffiliateDailyClicks {
  code: string;
  day: string;
  clicks: number;
}

interface AffiliateStats {
  affiliates: AffiliateClickStats[];
  daily: AffiliateDailyClicks[];
  generated_at: string;
}

interface OrderLike {
  amount: number;
  currency: string;
  created: number;
  affiliate?: string;
}

interface AffiliateRow extends AffiliateClickStats {
  conversions: number;
  revenue: number;
  convRate: number | null;
  avgOrder: number | null;
  lastOrder: number | null;
}

function formatMoney(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount / 100);
}

function formatPercent(rate: number): string {
  return `${(rate * 100).toFixed(rate >= 0.1 ? 0 : 1)}%`;
}

function StatTile({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-nova-border bg-white px-5 py-4 shadow-[0_12px_28px_rgba(10,47,107,0.06)]">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-nova-inkSoft">
        {label}
      </p>
      <p className="mt-1 text-2xl font-extrabold text-nova-navy">{value}</p>
      {hint && <p className="mt-0.5 text-xs text-nova-inkSoft">{hint}</p>}
    </div>
  );
}

/** Last-30-days click trend as a simple bar chart in the dashboard theme. */
function ClickTrend({ daily }: { daily: AffiliateDailyClicks[] }) {
  const days = useMemo(() => {
    const byDay = new Map<string, number>();
    for (const row of daily) {
      byDay.set(row.day, (byDay.get(row.day) ?? 0) + row.clicks);
    }
    const out: { day: string; clicks: number }[] = [];
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setUTCDate(d.getUTCDate() - i);
      const key = d.toISOString().slice(0, 10);
      out.push({ day: key, clicks: byDay.get(key) ?? 0 });
    }
    return out;
  }, [daily]);

  const max = Math.max(1, ...days.map((d) => d.clicks));
  const barW = 100 / days.length;

  return (
    <div className="rounded-2xl border border-nova-border bg-white p-5 shadow-[0_12px_28px_rgba(10,47,107,0.06)]">
      <div className="flex items-baseline justify-between">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-nova-inkSoft">
          Clicks — last 30 days
        </p>
        <p className="text-xs text-nova-inkSoft">
          {days.reduce((sum, d) => sum + d.clicks, 0)} total
        </p>
      </div>
      <svg
        viewBox="0 0 100 32"
        preserveAspectRatio="none"
        className="mt-3 h-24 w-full"
        role="img"
        aria-label="Daily affiliate link clicks over the last 30 days"
      >
        {days.map((d, i) => {
          const h = (d.clicks / max) * 28;
          return (
            <rect
              key={d.day}
              x={i * barW + barW * 0.15}
              y={32 - h}
              width={barW * 0.7}
              height={Math.max(h, d.clicks > 0 ? 0.75 : 0)}
              rx={0.6}
              className="fill-nova-navy"
            >
              <title>{`${d.day}: ${d.clicks} click${d.clicks === 1 ? "" : "s"}`}</title>
            </rect>
          );
        })}
      </svg>
      <div className="mt-1 flex justify-between text-[10px] text-nova-inkSoft">
        <span>{days[0]?.day}</span>
        <span>{days[days.length - 1]?.day}</span>
      </div>
    </div>
  );
}

function CopyLinkButton({ link }: { link: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        void navigator.clipboard.writeText(link).then(() => {
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1500);
        });
      }}
      className="rounded-full border border-nova-navy px-3 py-1 text-xs font-semibold text-nova-navy transition hover:bg-nova-off"
    >
      {copied ? "Copied!" : "Copy link"}
    </button>
  );
}

export default function AffiliatesView({ orders }: { orders: OrderLike[] | null }) {
  const [stats, setStats] = useState<AffiliateStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const response = await fetch("/api/admin/affiliates", {
          cache: "no-store",
        });
        const data = (await response.json()) as AffiliateStats & {
          error?: string;
        };
        if (!response.ok) {
          throw new Error(data.error || "Could not load affiliate stats.");
        }
        if (!cancelled) setStats(data);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Could not load affiliate stats.",
          );
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const currency = orders?.[0]?.currency ?? "usd";

  const rows: AffiliateRow[] | null = useMemo(() => {
    if (!stats) return null;
    const byCode = new Map<string, { conversions: number; revenue: number; lastOrder: number | null }>();
    for (const order of orders ?? []) {
      if (!order.affiliate) continue;
      const entry = byCode.get(order.affiliate) ?? {
        conversions: 0,
        revenue: 0,
        lastOrder: null,
      };
      entry.conversions += 1;
      entry.revenue += order.amount;
      entry.lastOrder = Math.max(entry.lastOrder ?? 0, order.created);
      byCode.set(order.affiliate, entry);
    }

    return stats.affiliates
      .map((aff) => {
        const sales = byCode.get(aff.code);
        const conversions = sales?.conversions ?? 0;
        return {
          ...aff,
          conversions,
          revenue: sales?.revenue ?? 0,
          convRate: aff.clicks_total > 0 ? conversions / aff.clicks_total : null,
          avgOrder: conversions > 0 ? (sales?.revenue ?? 0) / conversions : null,
          lastOrder: sales?.lastOrder ?? null,
        };
      })
      .sort((a, b) => b.revenue - a.revenue || b.clicks_total - a.clicks_total);
  }, [stats, orders]);

  const totals = useMemo(() => {
    if (!rows) return null;
    const clicks30 = rows.reduce((sum, r) => sum + r.clicks_30d, 0);
    const clicksAll = rows.reduce((sum, r) => sum + r.clicks_total, 0);
    const conversions = rows.reduce((sum, r) => sum + r.conversions, 0);
    const revenue = rows.reduce((sum, r) => sum + r.revenue, 0);
    const top = rows.find((r) => r.revenue > 0);
    return {
      clicks30: String(clicks30),
      clicksAll,
      conversions: String(conversions),
      convRate: clicksAll > 0 ? formatPercent(conversions / clicksAll) : "—",
      revenue: formatMoney(revenue, currency),
      top: top ? top.name || top.code : "—",
    };
  }, [rows, currency]);

  if (error) {
    return (
      <p className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
        {error}
      </p>
    );
  }
  if (!rows || !stats) {
    return (
      <p className="mt-6 py-12 text-center text-sm text-nova-inkSoft">
        Loading affiliate stats…
      </p>
    );
  }

  return (
    <div className="mt-6 space-y-4 pb-16">
      {totals && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatTile label="Clicks (30d)" value={totals.clicks30} hint={`${totals.clicksAll} all time`} />
          <StatTile label="Conversions" value={totals.conversions} hint={`${totals.convRate} of all clicks`} />
          <StatTile label="Affiliate revenue" value={totals.revenue} />
          <StatTile label="Top affiliate" value={totals.top} />
        </div>
      )}

      <ClickTrend daily={stats.daily} />

      <div className="overflow-hidden rounded-2xl border border-nova-border bg-white shadow-[0_12px_28px_rgba(10,47,107,0.06)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-nova-border text-xs font-bold uppercase tracking-[0.1em] text-nova-inkSoft">
                <th className="px-5 py-3">Affiliate</th>
                <th className="px-4 py-3 text-right">Clicks</th>
                <th className="px-4 py-3 text-right">30d</th>
                <th className="px-4 py-3 text-right">Orders</th>
                <th className="px-4 py-3 text-right">Conv.</th>
                <th className="px-4 py-3 text-right">Revenue</th>
                <th className="px-4 py-3 text-right">Avg order</th>
                <th className="px-5 py-3 text-right">Link</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-nova-inkSoft">
                    No affiliates yet — add codes on the storefront under
                    Settings → Affiliates.
                  </td>
                </tr>
              )}
              {rows.map((row) => (
                <tr key={row.code} className="border-b border-nova-border/60 last:border-0">
                  <td className="px-5 py-3">
                    <p className="font-bold text-nova-navy">{row.name || row.code}</p>
                    <p className="text-xs text-nova-inkSoft">
                      /{row.code}
                      {row.last_click
                        ? ` · last click ${row.last_click.slice(0, 10)}`
                        : " · no clicks yet"}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-nova-navy">
                    {row.clicks_total}
                  </td>
                  <td className="px-4 py-3 text-right text-nova-navySoft">
                    {row.clicks_30d}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-nova-navy">
                    {row.conversions}
                  </td>
                  <td className="px-4 py-3 text-right text-nova-navySoft">
                    {row.convRate !== null ? formatPercent(row.convRate) : "—"}
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-nova-navy">
                    {formatMoney(row.revenue, currency)}
                  </td>
                  <td className="px-4 py-3 text-right text-nova-navySoft">
                    {row.avgOrder !== null ? formatMoney(row.avgOrder, currency) : "—"}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <CopyLinkButton link={row.link} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-xs text-nova-inkSoft">
        Clicks are logged by the storefront; conversions are Stripe payments
        that carried the visitor&apos;s affiliate cookie through checkout
        (30-day, last-click attribution). Conversion counts cover the most
        recent 100 payments.
      </p>
    </div>
  );
}
