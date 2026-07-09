import type { Metadata } from "next";
import Link from "next/link";
import {
  CARRIERS,
  getOrderWithLiveTracking,
  trackingUrl,
  type AdminOrder,
} from "@/lib/orders";

export const metadata: Metadata = {
  title: "Your order · Satielle",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

function formatMoney(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount / 100);
}

function formatDate(unixSeconds: number): string {
  return new Date(unixSeconds * 1000).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function Step({
  label,
  state,
}: {
  label: string;
  state: "done" | "current" | "upcoming";
}) {
  return (
    <div className="flex flex-1 flex-col items-center gap-2">
      <span
        className={
          state === "done"
            ? "grid h-9 w-9 place-items-center rounded-full bg-nova-navy text-sm font-bold text-white shadow-[0_10px_20px_rgba(10,47,107,0.2)]"
            : state === "current"
              ? "grid h-9 w-9 place-items-center rounded-full bg-nova-gold text-sm font-bold text-nova-navyDeep shadow-[0_10px_20px_rgba(212,167,44,0.35)]"
              : "grid h-9 w-9 place-items-center rounded-full border-2 border-nova-border bg-white text-sm font-bold text-nova-inkSoft"
        }
      >
        {state === "done" ? "✓" : state === "current" ? "•" : ""}
      </span>
      <span
        className={`text-center text-xs font-semibold uppercase tracking-[0.08em] ${
          state === "upcoming" ? "text-nova-inkSoft" : "text-nova-navy"
        }`}
      >
        {label}
      </span>
    </div>
  );
}

function Connector({ done }: { done: boolean }) {
  return (
    <div
      className={`mt-[17px] h-0.5 flex-1 rounded ${done ? "bg-nova-gold" : "bg-nova-border"}`}
    />
  );
}

function StatusCard({ order }: { order: AdminOrder }) {
  const tracking = order.tracking;
  const shipped = Boolean(tracking);
  const stage = tracking?.stage;
  const delivered = stage === "delivered";
  const outForDelivery = stage === "out_for_delivery";
  const exception = stage === "exception";
  const trackUrl = tracking
    ? trackingUrl(tracking.carrier, tracking.number)
    : undefined;
  const shipTo = [order.shipping?.city, order.shipping?.state]
    .filter(Boolean)
    .join(", ");

  const headline = delivered
    ? "Your order has been delivered"
    : outForDelivery
      ? "Your order is out for delivery"
      : shipped
        ? "Your order is on its way"
        : "We are processing your order";
  const badge = delivered
    ? "Delivered"
    : outForDelivery
      ? "Out for delivery"
      : shipped
        ? "Shipped"
        : "Processing";
  const copy = delivered
    ? "It has arrived — we hope you love it. The final scan from the carrier is below."
    : outForDelivery
      ? "It's on the truck and should arrive today. Follow the last mile with the tracking details below."
      : shipped
        ? "It has left our fulfillment team and is with the carrier now. Follow it with the tracking details below."
        : "Your payment is confirmed and our team is preparing your order for shipment. This page updates as soon as it ships.";
  const goldBadge = !shipped || outForDelivery;

  return (
    <div className="rounded-2xl border border-nova-border bg-white p-8 shadow-[0_24px_60px_rgba(10,47,107,0.09)] sm:p-10">
      <div className="flex flex-col items-center text-center">
        <span
          className={
            goldBadge
              ? "rounded-full bg-nova-gold px-4 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-nova-navyDeep"
              : "rounded-full bg-nova-navy px-4 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-nova-goldLight"
          }
        >
          {badge}
        </span>
        <h1 className="mt-5 text-3xl font-extrabold leading-tight text-nova-navy sm:text-4xl">
          {headline}
        </h1>
        <p className="mx-auto mt-3 max-w-md text-base leading-relaxed text-nova-inkSoft">
          {copy}
        </p>
      </div>

      <div className="mx-auto mt-8 flex max-w-md items-start">
        <Step label="Order placed" state="done" />
        <Connector done />
        <Step label="Processing" state={shipped ? "done" : "current"} />
        <Connector done={shipped} />
        <Step
          label="Shipped"
          state={
            delivered || outForDelivery
              ? "done"
              : shipped
                ? "current"
                : "upcoming"
          }
        />
        <Connector done={delivered || outForDelivery} />
        <Step
          label="Delivered"
          state={
            delivered ? "done" : outForDelivery ? "current" : "upcoming"
          }
        />
      </div>

      {tracking?.stageSummary && (
        <p
          className={`mx-auto mt-6 max-w-md rounded-xl px-4 py-3 text-center text-sm leading-relaxed ${
            exception
              ? "bg-amber-50 text-amber-800"
              : "bg-nova-off text-nova-navySoft"
          }`}
        >
          Latest from {CARRIERS[tracking.carrier].label}:{" "}
          {tracking.stageSummary}
        </p>
      )}

      {order.tracking && (
        <div className="mt-9 rounded-xl bg-nova-navy p-6 text-center shadow-[0_18px_40px_rgba(10,47,107,0.25)]">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-nova-goldLight">
            {CARRIERS[order.tracking.carrier].label} tracking number
          </p>
          <p className="mt-2 break-all text-xl font-bold tracking-[0.06em] text-white">
            {order.tracking.number}
          </p>
          {trackUrl && (
            <a
              href={trackUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-5 inline-block rounded-full bg-nova-gold px-8 py-3 text-sm font-bold text-nova-navyDeep transition hover:bg-nova-goldLight"
            >
              Track your package
            </a>
          )}
        </div>
      )}

      <div className="mt-9 border-t border-nova-border pt-6">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-nova-inkSoft">
          Order summary
        </p>
        <div className="mt-3 space-y-2">
          {order.items.length ? (
            order.items.map((item, index) => (
              <div
                key={index}
                className="flex items-baseline justify-between gap-4 text-[15px] text-nova-navy"
              >
                <span>
                  {item.quantity}× {item.name}
                </span>
                {typeof item.lineTotal === "number" && (
                  <span className="shrink-0 font-semibold">
                    {formatMoney(item.lineTotal, order.currency)}
                  </span>
                )}
              </div>
            ))
          ) : (
            <p className="text-[15px] text-nova-inkSoft">
              Your items are listed on your email receipt.
            </p>
          )}
        </div>
        <div className="mt-4 flex items-baseline justify-between border-t border-nova-border pt-4">
          <span className="text-sm font-bold uppercase tracking-[0.1em] text-nova-navy">
            Total
          </span>
          <span className="text-lg font-extrabold text-nova-navy">
            {formatMoney(order.amount, order.currency)}
          </span>
        </div>
        <p className="mt-4 text-sm text-nova-inkSoft">
          Placed {formatDate(order.created)}
          {shipTo ? ` · Shipping to ${shipTo}` : ""}
        </p>
      </div>
    </div>
  );
}

function MessageCard({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  return (
    <div className="rounded-2xl border border-nova-border bg-white p-8 text-center shadow-[0_24px_60px_rgba(10,47,107,0.09)] sm:p-10">
      <h1 className="text-2xl font-extrabold text-nova-navy">{title}</h1>
      <p className="mx-auto mt-3 max-w-md text-base leading-relaxed text-nova-inkSoft">
        {message}
      </p>
      <Link
        href="/"
        className="mt-6 inline-block rounded-full bg-nova-navy px-8 py-3 text-sm font-bold text-white transition hover:bg-nova-navyDeep"
      >
        Back to the shop
      </Link>
    </div>
  );
}

export default async function OrderStatusPage({
  params,
}: {
  params: { id: string };
}) {
  let order: AdminOrder | null = null;
  let unavailable = false;

  if (params.id.startsWith("pi_")) {
    try {
      order = await getOrderWithLiveTracking(params.id);
    } catch {
      unavailable = true;
    }
  }

  return (
    <main className="min-h-screen bg-nova-off px-5 py-12 sm:px-6 sm:py-16">
      <div className="mx-auto w-full max-w-xl">
        <p className="pb-6 text-center text-sm font-bold uppercase tracking-[0.3em] text-nova-navy">
          Satielle
        </p>
        {order ? (
          <StatusCard order={order} />
        ) : unavailable ? (
          <MessageCard
            title="We can't load your order right now"
            message="Please try again in a few minutes, or reply to your confirmation email and we'll check on it for you."
          />
        ) : (
          <MessageCard
            title="We couldn't find that order"
            message="Double-check the link from your confirmation email. If it still doesn't work, reply to that email and we'll track it down for you."
          />
        )}
        <p className="pt-6 text-center text-xs text-nova-inkSoft">
          Order reference {params.id}
        </p>
      </div>
    </main>
  );
}
