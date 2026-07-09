"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type CarrierId = "usps" | "ups" | "fedex" | "dhl" | "other";

const CARRIER_LABELS: Record<CarrierId, string> = {
  usps: "USPS",
  ups: "UPS",
  fedex: "FedEx",
  dhl: "DHL",
  other: "Other",
};

interface OrderItem {
  name: string;
  quantity: number;
  lineTotal?: number;
}

interface OrderShipping {
  name?: string;
  phone?: string;
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

interface OrderTracking {
  number: string;
  carrier: CarrierId;
  emailedAt?: string;
}

interface AdminOrder {
  id: string;
  created: number;
  amount: number;
  currency: string;
  status: "succeeded" | "processing";
  email?: string;
  source?: string;
  items: OrderItem[];
  shipping?: OrderShipping;
  tracking?: OrderTracking;
}

function formatMoney(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount / 100);
}

function formatDate(unixSeconds: number): string {
  return new Date(unixSeconds * 1000).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-[#fffdfa] px-5 py-4 shadow-[0_8px_24px_rgba(127,85,57,0.08)]">
      <p className="text-xs uppercase tracking-[0.14em] text-[#b08968]">
        {label}
      </p>
      <p
        className="mt-1 text-2xl text-[#7f5539]"
        style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
      >
        {value}
      </p>
    </div>
  );
}

function TrackingForm({
  order,
  onSaved,
}: {
  order: AdminOrder;
  onSaved: (order: AdminOrder, message: string, isError: boolean) => void;
}) {
  const [trackingNumber, setTrackingNumber] = useState(
    order.tracking?.number ?? "",
  );
  const [carrier, setCarrier] = useState<CarrierId | "auto">(
    order.tracking?.carrier ?? "auto",
  );
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    const response = await fetch(
      `/api/admin/orders/${encodeURIComponent(order.id)}/tracking`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          trackingNumber,
          ...(carrier !== "auto" ? { carrier } : {}),
        }),
      },
    );
    const data = (await response.json().catch(() => ({}))) as {
      order?: AdminOrder;
      emailSent?: boolean;
      emailError?: string;
      error?: string;
    };
    setSaving(false);

    if (!response.ok || !data.order) {
      onSaved(order, data.error || "Could not save the tracking number.", true);
      return;
    }

    if (data.emailSent) {
      onSaved(
        data.order,
        `Tracking saved — email sent to ${order.email}.`,
        false,
      );
    } else {
      onSaved(
        data.order,
        `Tracking saved, but no email went out: ${data.emailError ?? "unknown reason"}`,
        true,
      );
    }
  }

  const isUpdate = Boolean(order.tracking);

  return (
    <div className="rounded-xl border border-[#e6ccb2] bg-[#faf4ec] p-4">
      <p className="text-xs font-medium uppercase tracking-[0.14em] text-[#b08968]">
        {isUpdate ? "Update tracking" : "Add tracking"}
      </p>
      <div className="mt-3 flex flex-col gap-3 sm:flex-row">
        <input
          value={trackingNumber}
          onChange={(event) => setTrackingNumber(event.target.value)}
          placeholder="Tracking number"
          className="min-w-0 flex-1 rounded-lg border border-[#e6ccb2] bg-white px-3 py-2.5 text-sm text-[#7f5539] outline-none transition focus:border-[#b08968]"
        />
        <select
          value={carrier}
          onChange={(event) =>
            setCarrier(event.target.value as CarrierId | "auto")
          }
          className="rounded-lg border border-[#e6ccb2] bg-white px-3 py-2.5 text-sm text-[#7f5539] outline-none transition focus:border-[#b08968]"
        >
          <option value="auto">Auto-detect carrier</option>
          {Object.entries(CARRIER_LABELS).map(([id, label]) => (
            <option key={id} value={id}>
              {label}
            </option>
          ))}
        </select>
        <button
          onClick={handleSave}
          disabled={saving || trackingNumber.trim().length < 4}
          className="rounded-full bg-[#7f5539] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#6b4429] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save & email customer"}
        </button>
      </div>
      <p className="mt-2 text-xs text-[#9c8570]">
        Saving emails the customer their tracking number
        {order.email ? ` (${order.email})` : " — no email on this order"}.
      </p>
    </div>
  );
}

function OrderRow({
  order,
  expanded,
  onToggle,
  onSaved,
}: {
  order: AdminOrder;
  expanded: boolean;
  onToggle: () => void;
  onSaved: (order: AdminOrder, message: string, isError: boolean) => void;
}) {
  const shipping = order.shipping;
  const addressLines = shipping
    ? [
        shipping.name,
        shipping.line1,
        shipping.line2,
        [shipping.city, shipping.state, shipping.postalCode]
          .filter(Boolean)
          .join(", "),
        shipping.country,
      ].filter(Boolean)
    : [];

  return (
    <div className="overflow-hidden rounded-2xl bg-[#fffdfa] shadow-[0_8px_24px_rgba(127,85,57,0.08)] transition hover:shadow-[0_12px_32px_rgba(127,85,57,0.12)]">
      <button
        onClick={onToggle}
        className="flex w-full items-center gap-4 px-5 py-4 text-left"
      >
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-[#7f5539]">
            {shipping?.name || order.email || order.id}
          </p>
          <p className="mt-0.5 truncate text-xs text-[#9c8570]">
            {formatDate(order.created)}
            {order.source ? ` · ${order.source}` : ""}
            {order.items.length
              ? ` · ${order.items
                  .map((item) => `${item.quantity}× ${item.name}`)
                  .join(", ")}`
              : ""}
          </p>
        </div>
        <span
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
            order.tracking
              ? "bg-[#e2f5ea] text-[#296853]"
              : "bg-[#faf0dc] text-[#9c6644]"
          }`}
        >
          {order.tracking ? "Shipped" : "To ship"}
        </span>
        <span className="shrink-0 text-sm font-semibold text-[#7f5539]">
          {formatMoney(order.amount, order.currency)}
        </span>
        <span
          className={`shrink-0 text-[#b08968] transition-transform ${expanded ? "rotate-180" : ""}`}
        >
          ▾
        </span>
      </button>

      {expanded && (
        <div className="space-y-4 border-t border-[#f0e4d6] px-5 py-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-[#b08968]">
                Customer
              </p>
              <p className="mt-1 text-sm text-[#5d4a3a]">
                {order.email || "No email on file"}
              </p>
              {shipping?.phone && (
                <p className="text-sm text-[#5d4a3a]">{shipping.phone}</p>
              )}
              <p className="mt-2 text-xs font-medium uppercase tracking-[0.14em] text-[#b08968]">
                Ship to
              </p>
              {addressLines.length ? (
                addressLines.map((line, index) => (
                  <p key={index} className="text-sm text-[#5d4a3a]">
                    {line}
                  </p>
                ))
              ) : (
                <p className="text-sm italic text-[#9c8570]">
                  No shipping address on the payment.
                </p>
              )}
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-[#b08968]">
                Items
              </p>
              {order.items.length ? (
                order.items.map((item, index) => (
                  <p key={index} className="mt-1 text-sm text-[#5d4a3a]">
                    {item.quantity}× {item.name}
                    {typeof item.lineTotal === "number"
                      ? ` — ${formatMoney(item.lineTotal, order.currency)}`
                      : ""}
                  </p>
                ))
              ) : (
                <p className="mt-1 text-sm italic text-[#9c8570]">
                  Line items not recorded — see Stripe.
                </p>
              )}
              <p className="mt-3 text-xs text-[#9c8570]">
                {order.id} ·{" "}
                <a
                  href={`https://dashboard.stripe.com/payments/${order.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="underline decoration-[#ddb892] underline-offset-2 hover:text-[#7f5539]"
                >
                  View in Stripe
                </a>
              </p>
              {order.tracking && (
                <p className="mt-2 text-sm text-[#296853]">
                  {CARRIER_LABELS[order.tracking.carrier]} ·{" "}
                  {order.tracking.number}
                  {order.tracking.emailedAt
                    ? ` · customer emailed ${formatDate(Date.parse(order.tracking.emailedAt) / 1000)}`
                    : ""}
                </p>
              )}
            </div>
          </div>

          <TrackingForm order={order} onSaved={onSaved} />
        </div>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  const router = useRouter();
  const [orders, setOrders] = useState<AdminOrder[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [notice, setNotice] = useState<{
    message: string;
    isError: boolean;
  } | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadOrders = useCallback(async () => {
    setRefreshing(true);
    setLoadError(null);
    try {
      const response = await fetch("/api/admin/orders", { cache: "no-store" });
      const data = (await response.json()) as {
        orders?: AdminOrder[];
        error?: string;
      };
      if (!response.ok || !data.orders) {
        throw new Error(data.error || "Could not load orders.");
      }
      setOrders(data.orders);
    } catch (err) {
      setLoadError(
        err instanceof Error ? err.message : "Could not load orders.",
      );
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  async function handleLogout() {
    await fetch("/api/admin/login", { method: "DELETE" });
    router.refresh();
  }

  function handleSaved(
    updated: AdminOrder,
    message: string,
    isError: boolean,
  ) {
    setOrders(
      (current) =>
        current?.map((order) => (order.id === updated.id ? updated : order)) ??
        null,
    );
    setNotice({ message, isError });
    window.setTimeout(() => setNotice(null), 6000);
  }

  const filtered = useMemo(() => {
    if (!orders) return null;
    const needle = query.trim().toLowerCase();
    if (!needle) return orders;
    return orders.filter((order) =>
      [
        order.id,
        order.email,
        order.source,
        order.shipping?.name,
        order.shipping?.city,
        order.tracking?.number,
        ...order.items.map((item) => item.name),
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(needle)),
    );
  }, [orders, query]);

  const stats = useMemo(() => {
    if (!orders) return null;
    const revenue = orders.reduce((sum, order) => sum + order.amount, 0);
    const currency = orders[0]?.currency ?? "usd";
    const toShip = orders.filter((order) => !order.tracking).length;
    return {
      count: String(orders.length),
      revenue: formatMoney(revenue, currency),
      toShip: String(toShip),
      shipped: String(orders.length - toShip),
    };
  }, [orders]);

  return (
    <main className="min-h-screen bg-[#ede0d4] px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-4xl">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[#b08968]">
              Satielle
            </p>
            <h1
              className="mt-1 text-3xl text-[#7f5539]"
              style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
            >
              Orders
            </h1>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => void loadOrders()}
              disabled={refreshing}
              className="rounded-full border border-[#b08968] px-4 py-2 text-sm font-medium text-[#7f5539] transition hover:bg-[#fffdfa] disabled:opacity-50"
            >
              {refreshing ? "Refreshing…" : "Refresh"}
            </button>
            <button
              onClick={() => void handleLogout()}
              className="rounded-full px-4 py-2 text-sm font-medium text-[#9c8570] transition hover:text-[#7f5539]"
            >
              Sign out
            </button>
          </div>
        </header>

        {stats && (
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatTile label="Orders" value={stats.count} />
            <StatTile label="Revenue" value={stats.revenue} />
            <StatTile label="To ship" value={stats.toShip} />
            <StatTile label="Shipped" value={stats.shipped} />
          </div>
        )}

        {notice && (
          <p
            className={`mt-4 rounded-xl px-4 py-3 text-sm ${
              notice.isError
                ? "bg-red-50 text-red-700"
                : "bg-[#e2f5ea] text-[#296853]"
            }`}
          >
            {notice.message}
          </p>
        )}

        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by name, email, product, city, or tracking number"
          className="mt-6 w-full rounded-xl border border-[#e6ccb2] bg-[#fffdfa] px-4 py-3 text-sm text-[#7f5539] outline-none transition placeholder:text-[#c4a889] focus:border-[#b08968] focus:ring-2 focus:ring-[#ddb892]/40"
        />

        <div className="mt-4 space-y-3 pb-16">
          {loadError && (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
              {loadError}
            </p>
          )}
          {!orders && !loadError && (
            <p className="py-12 text-center text-sm text-[#9c8570]">
              Loading orders…
            </p>
          )}
          {filtered && filtered.length === 0 && (
            <p className="py-12 text-center text-sm text-[#9c8570]">
              {query
                ? "No orders match that search."
                : "No paid orders yet — they appear here the moment a checkout completes."}
            </p>
          )}
          {filtered?.map((order) => (
            <OrderRow
              key={order.id}
              order={order}
              expanded={expandedId === order.id}
              onToggle={() =>
                setExpandedId((current) =>
                  current === order.id ? null : order.id,
                )
              }
              onSaved={handleSaved}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
