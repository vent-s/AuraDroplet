'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js';
import { CheckCircle2, Lock, ShieldCheck } from 'lucide-react';
import {
  captureAnalyticsEvent,
  identifyAnalyticsDistinctId,
} from '@/lib/analytics';

type CheckoutSource = 'satielle' | 'velluracare';

type CheckoutSession = {
  cartId: string;
  clientSecret: string;
  amount: number;
  currency: string;
};

type HandoffLineItem = {
  id: string;
  name: string;
  quantity: number;
  lineTotal: number; // integer cents
};

type CheckoutDisplay = {
  source: CheckoutSource | string;
  title: string;
  lineItemLabel: string;
  image: string;
  previewAmount?: number;
  items?: HandoffLineItem[];
  currency?: string;
  returnUrl?: string;
};

type ResolvedHandoff = {
  source: string;
  title: string;
  lineItemLabel: string;
  items?: HandoffLineItem[];
  currency?: string;
  cartTotal?: number;
  email?: string;
  customerName?: string;
  posthogDistinctId?: string;
  returnUrl?: string;
};

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = publishableKey ? loadStripe(publishableKey) : null;

const serifClass = '[font-family:var(--font-playfair),ui-serif,Georgia,serif]';
const shellClass =
  '[font-family:var(--font-manrope),ui-sans-serif,system-ui,sans-serif] tracking-normal';
const inputClass =
  'w-full rounded-lg border border-line bg-white px-4 py-3.5 text-base text-ink placeholder:text-muted/70 focus-visible:outline-2 focus-visible:outline-brand-600';
const primaryButtonClass =
  'inline-flex items-center justify-center gap-2 rounded-full bg-ink px-8 py-3.5 text-base font-semibold text-white transition active:scale-[0.98] hover:bg-brand-900 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700';
const secondaryButtonClass =
  'inline-flex items-center justify-center gap-2 rounded-full border border-ink/20 bg-transparent px-8 py-3.5 text-base font-semibold text-ink transition active:scale-[0.98] hover:border-ink/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700';
const novaButtonClass =
  'inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-br from-nova-goldLight to-nova-gold px-8 py-4 text-sm font-extrabold uppercase tracking-wide text-nova-navyDeep shadow-[0_14px_30px_rgba(212,167,44,0.34)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_36px_rgba(212,167,44,0.42)] disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-70 disabled:shadow-none';

function formatAmount(amount: number, currency: string) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount);
}

function formatCents(cents: number, currency: string) {
  return formatAmount(cents / 100, currency);
}

function getDisplay(
  searchParams: URLSearchParams,
  handoff?: ResolvedHandoff | null,
): CheckoutDisplay {
  if (handoff) {
    return {
      source: handoff.source,
      title: handoff.title,
      lineItemLabel: handoff.lineItemLabel,
      image: '/sema-product.png',
      items: handoff.items,
      currency: handoff.currency,
      returnUrl: handoff.returnUrl,
    };
  }

  if (searchParams.get('test') === '1') {
    return {
      source: 'checkout-test',
      title: 'Checkout test payment',
      lineItemLabel: 'Stripe checkout test',
      image: '/SatielleProduct.jpg',
      previewAmount: 0.5,
      currency: 'usd',
      returnUrl: searchParams.get('return_url') || undefined,
    };
  }

  const source =
    searchParams.get('source') === 'velluracare' ? 'velluracare' : 'satielle';
  const title =
    source === 'velluracare'
      ? 'VelluraCare plan'
      : 'Satielle Diffuser Kit';

  return {
    source,
    title,
    lineItemLabel:
      source === 'velluracare' ? `${title} - first month` : `${title} - kit`,
    image:
      source === 'velluracare' ? '/sema-product.png' : '/SatielleProduct.jpg',
    returnUrl: searchParams.get('return_url') || undefined,
  };
}

function ShippingAddressFields({
  customerName,
  isNovaLife,
}: {
  customerName?: string;
  isNovaLife: boolean;
}) {
  const labelClass = `mb-1.5 block text-sm font-semibold ${
    isNovaLife ? 'text-nova-navy' : 'text-ink'
  }`;
  const fieldClass = isNovaLife
    ? 'w-full rounded-lg border border-nova-border bg-white px-4 py-3.5 text-base text-nova-navy focus-visible:outline-2 focus-visible:outline-nova-gold'
    : inputClass;

  return (
    <fieldset className="space-y-4">
      <legend
        className={`text-base font-semibold ${
          isNovaLife ? 'text-nova-navy' : 'text-ink'
        }`}
      >
        Shipping address
      </legend>

      <div>
        <label htmlFor="shippingName" className={labelClass}>
          Full name
        </label>
        <input
          id="shippingName"
          name="shippingName"
          type="text"
          autoComplete="name"
          defaultValue={customerName}
          className={fieldClass}
          required
        />
      </div>

      <div>
        <label htmlFor="shippingAddress1" className={labelClass}>
          Address
        </label>
        <input
          id="shippingAddress1"
          name="shippingAddress1"
          type="text"
          autoComplete="shipping address-line1"
          className={fieldClass}
          required
        />
      </div>

      <div>
        <label htmlFor="shippingAddress2" className={labelClass}>
          Apartment, suite, etc. <span className="font-normal">(optional)</span>
        </label>
        <input
          id="shippingAddress2"
          name="shippingAddress2"
          type="text"
          autoComplete="shipping address-line2"
          className={fieldClass}
        />
      </div>

      <div>
        <label htmlFor="shippingCity" className={labelClass}>
          City
        </label>
        <input
          id="shippingCity"
          name="shippingCity"
          type="text"
          autoComplete="shipping address-level2"
          className={fieldClass}
          required
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="shippingState" className={labelClass}>
            State
          </label>
          <input
            id="shippingState"
            name="shippingState"
            type="text"
            autoComplete="shipping address-level1"
            maxLength={2}
            pattern="[A-Za-z]{2}"
            title="Enter a two-letter US state code."
            className={`${fieldClass} uppercase`}
            required
          />
        </div>
        <div>
          <label htmlFor="shippingPostalCode" className={labelClass}>
            ZIP code
          </label>
          <input
            id="shippingPostalCode"
            name="shippingPostalCode"
            type="text"
            inputMode="numeric"
            autoComplete="shipping postal-code"
            pattern="[0-9]{5}(-[0-9]{4})?"
            title="Enter a five-digit ZIP code, optionally followed by four digits."
            className={fieldClass}
            required
          />
        </div>
      </div>

      <div>
        <label htmlFor="shippingPhone" className={labelClass}>
          Phone <span className="font-normal">(optional)</span>
        </label>
        <input
          id="shippingPhone"
          name="shippingPhone"
          type="tel"
          autoComplete="shipping tel"
          className={fieldClass}
        />
      </div>

      <div>
        <label htmlFor="shippingCountry" className={labelClass}>
          Country
        </label>
        <input
          id="shippingCountry"
          type="text"
          value="United States"
          className={`${fieldClass} ${
            isNovaLife ? 'bg-nova-off text-nova-inkSoft' : 'bg-cream'
          }`}
          readOnly
        />
      </div>
    </fieldset>
  );
}

function PaymentForm({
  session,
  analyticsSource,
  analyticsTitle,
  customerName,
  isNovaLife,
  onSuccess,
}: {
  session: CheckoutSession;
  analyticsSource: CheckoutSource | string;
  analyticsTitle: string;
  customerName?: string;
  isNovaLife: boolean;
  onSuccess: (orderId: string) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    captureAnalyticsEvent('satielle', 'payment_info_loaded', {
      checkout_source: analyticsSource,
      product_title: analyticsTitle,
      amount: session.amount,
      currency: session.currency,
    });
  }, [analyticsSource, analyticsTitle, session.amount, session.currency]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!stripe || !elements) return;

    setSubmitting(true);
    setError(null);
    captureAnalyticsEvent('satielle', 'payment_submitted', {
      checkout_source: analyticsSource,
      product_title: analyticsTitle,
      amount: session.amount,
      currency: session.currency,
    });

    const formData = new FormData(event.currentTarget);
    const fullName = String(formData.get('shippingName') || '').trim();
    const [firstName, ...lastNameParts] = fullName.split(/\s+/);
    const address = {
      first_name: firstName,
      last_name: lastNameParts.join(' ') || firstName,
      address_1: String(formData.get('shippingAddress1') || '').trim(),
      address_2:
        String(formData.get('shippingAddress2') || '').trim() || undefined,
      city: String(formData.get('shippingCity') || '').trim(),
      province: String(formData.get('shippingState') || '')
        .trim()
        .toUpperCase(),
      postal_code: String(formData.get('shippingPostalCode') || '').trim(),
      country_code: 'us',
      phone: String(formData.get('shippingPhone') || '').trim() || undefined,
    };

    const addressResponse = await fetch('/api/medusa-checkout/address', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        cartId: session.cartId,
        address,
        clientSecret: session.clientSecret,
      }),
    });

    if (!addressResponse.ok) {
      const data = (await addressResponse.json()) as { error?: string };
      setError(data.error || 'We could not save your shipping address.');
      captureAnalyticsEvent('satielle', 'payment_address_failed', {
        checkout_source: analyticsSource,
        product_title: analyticsTitle,
      });
      setSubmitting(false);
      return;
    }

    const { error: confirmError } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: window.location.href },
      redirect: 'if_required',
    });

    if (confirmError) {
      setError(confirmError.message || 'We could not process that payment.');
      captureAnalyticsEvent('satielle', 'payment_failed', {
        checkout_source: analyticsSource,
        product_title: analyticsTitle,
      });
      setSubmitting(false);
      return;
    }

    const completeResponse = await fetch('/api/medusa-checkout/complete', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        cartId: session.cartId,
        clientSecret: session.clientSecret,
      }),
    });
    const completeData = (await completeResponse.json()) as {
      orderId?: string;
      error?: string;
    };

    if (!completeResponse.ok || !completeData.orderId) {
      setError(
        completeData.error || 'Payment succeeded, but the order did not finish.',
      );
      captureAnalyticsEvent('satielle', 'order_completion_failed', {
        checkout_source: analyticsSource,
        product_title: analyticsTitle,
      });
      setSubmitting(false);
      return;
    }

    captureAnalyticsEvent('satielle', 'order_completed', {
      checkout_source: analyticsSource,
      product_title: analyticsTitle,
      amount: session.amount,
      currency: session.currency,
    });
    onSuccess(completeData.orderId);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <ShippingAddressFields
        customerName={customerName}
        isNovaLife={isNovaLife}
      />
      <PaymentElement />
      {error && (
        <p
          className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
          role="alert"
        >
          {error}
        </p>
      )}
      <button
        type="submit"
        className={`${isNovaLife ? novaButtonClass : primaryButtonClass} w-full`}
        disabled={!stripe || submitting}
      >
        {submitting
          ? 'Processing...'
          : `Pay ${formatAmount(session.amount, session.currency)}`}
      </button>
      <p className="flex items-start gap-2 text-sm text-muted">
        <Lock
          size={15}
          className={`mt-0.5 shrink-0 ${isNovaLife ? 'text-nova-gold' : 'text-brand-500'}`}
        />
        Card details are encrypted and handled by Stripe. They never touch our
        servers.
      </p>
    </form>
  );
}

function CheckoutContent() {
  const searchParams = useSearchParams();
  const handoffToken = searchParams.get('handoff') || undefined;
  const [handoff, setHandoff] = useState<ResolvedHandoff | null>(null);
  const display = useMemo(
    () => getDisplay(new URLSearchParams(searchParams.toString()), handoff),
    [searchParams, handoff],
  );
  const isNovaLife = display.source === 'novalife.science';
  const isTestCheckout = display.source === 'checkout-test';
  const startedFromHandoff = useRef(false);

  const [email, setEmail] = useState('');
  const [session, setSession] = useState<CheckoutSession | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [handoffLoading, setHandoffLoading] = useState(Boolean(handoffToken));
  const [handoffError, setHandoffError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requiresHandoff = display.source === 'velluracare' && !handoffToken;

  useEffect(() => {
    if (handoffToken) return;

    captureAnalyticsEvent('satielle', 'checkout_loaded', {
      checkout_source: display.source,
      product_title: display.title,
      handoff_present: false,
    });
  }, [display.source, display.title, handoffToken]);

  async function startCheckout(nextEmail = email) {
    if (display.source === 'velluracare' && !handoffToken) {
      setError('Return to VelluraCare and start secure checkout again.');
      return;
    }

    if (handoffToken && !handoff) {
      setError('Checkout handoff is still loading.');
      return;
    }

    if (!handoffToken && !nextEmail.includes('@')) {
      setError('Enter an email address to continue.');
      return;
    }

    setLoading(true);
    setError(null);
    captureAnalyticsEvent('satielle', 'checkout_session_requested', {
      checkout_source: display.source,
      product_title: display.title,
      handoff_present: Boolean(handoffToken),
    });

    try {
      const response = await fetch('/api/medusa-checkout', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(
          handoffToken
            ? { handoff: handoffToken }
            : isTestCheckout
              ? {
                  source: 'checkout-test',
                  email: nextEmail,
                  test: true,
                }
            : {
                source: display.source,
                email: nextEmail,
              },
        ),
      });
      const data = (await response.json()) as CheckoutSession & {
        error?: string;
      };

      if (!response.ok || !data.clientSecret || !data.cartId) {
        throw new Error(data.error || 'Could not start checkout.');
      }

      setSession({
        cartId: data.cartId,
        clientSecret: data.clientSecret,
        amount: data.amount,
        currency: data.currency,
      });
      captureAnalyticsEvent('satielle', 'checkout_session_created', {
        checkout_source: display.source,
        product_title: display.title,
        amount: data.amount,
        currency: data.currency,
        handoff_present: Boolean(handoffToken),
      });
    } catch (err) {
      captureAnalyticsEvent('satielle', 'checkout_session_failed', {
        checkout_source: display.source,
        product_title: display.title,
        handoff_present: Boolean(handoffToken),
      });
      setError(err instanceof Error ? err.message : 'Could not start checkout.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!handoffToken) return;

    let cancelled = false;
    async function resolveHandoff() {
      setHandoffLoading(true);
      setHandoffError(null);
      setError(null);

      try {
        const response = await fetch('/api/checkout-handoff/resolve', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ handoff: handoffToken }),
        });
        const data = (await response.json()) as ResolvedHandoff & {
          error?: string;
        };

        if (!response.ok || data.error || (!data.email && !data.items?.length)) {
          throw new Error(data.error || 'Checkout handoff expired.');
        }

        if (!cancelled) {
          identifyAnalyticsDistinctId('satielle', data.posthogDistinctId);
          captureAnalyticsEvent('satielle', 'checkout_loaded', {
            checkout_source: data.source,
            product_title: data.title,
            handoff_present: true,
          });
          setHandoff(data);
          setEmail(data.email ?? '');
        }
      } catch (err) {
        if (!cancelled) {
          const message =
            err instanceof Error ? err.message : 'Checkout handoff expired.';
          setHandoffError(message);
          setError(message);
        }
      } finally {
        if (!cancelled) setHandoffLoading(false);
      }
    }

    void resolveHandoff();
    return () => {
      cancelled = true;
    };
  }, [handoffToken]);

  useEffect(() => {
    if (!handoffToken || !handoff || startedFromHandoff.current || session) {
      return;
    }
    startedFromHandoff.current = true;
    void startCheckout(handoff.email ?? '');
    // startCheckout intentionally reads the resolved handoff state once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handoffToken, handoff, session]);

  const statusOrderId = session
    ? session.cartId.startsWith('pi_')
      ? session.cartId
      : (/^(pi_[^_]+)_secret_/.exec(session.clientSecret)?.[1] ?? null)
    : null;

  if (orderId) {
    return (
      <main
        className={`min-h-screen ${isNovaLife ? 'bg-nova-off' : 'bg-cream'} py-12 sm:py-16 ${shellClass}`}
      >
        <div className="mx-auto w-full max-w-xl px-5 sm:px-6">
          <div
            className={
              isNovaLife
                ? 'rounded-2xl border border-nova-border bg-white p-8 text-center shadow-[0_24px_60px_rgba(10,47,107,0.09)] sm:p-10'
                : 'rounded-lg border border-brand-200 bg-white p-8 text-center sm:p-10'
            }
          >
            <span
              className={
                isNovaLife
                  ? 'mx-auto grid h-16 w-16 place-items-center rounded-full bg-nova-navy text-white shadow-[0_14px_26px_rgba(10,47,107,0.22)]'
                  : 'mx-auto grid h-16 w-16 place-items-center rounded-full bg-brand-50 text-brand-600'
              }
            >
              <CheckCircle2 size={32} />
            </span>
            <h1
              className={
                isNovaLife
                  ? `mt-5 text-3xl font-extrabold text-nova-navy ${shellClass}`
                  : `mt-5 text-3xl font-medium text-ink ${serifClass}`
              }
            >
              You&apos;re all set.
            </h1>
            <p
              className={`mx-auto mt-3 max-w-md text-base leading-relaxed ${isNovaLife ? 'text-nova-inkSoft' : 'text-muted'}`}
            >
              {isTestCheckout
                ? 'Your 50-cent checkout test completed successfully.'
                : 'Your order is in. We’ll follow up with next steps.'}
            </p>
            <ol
              className={`mx-auto mt-6 max-w-sm space-y-3 text-left text-base ${isNovaLife ? 'text-nova-navy' : 'text-ink'}`}
            >
              <li className="flex gap-3">
                <span
                  className={
                    isNovaLife
                      ? 'grid h-6 w-6 shrink-0 place-items-center rounded-full bg-nova-gold text-sm font-bold text-nova-navyDeep'
                      : 'grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand-500 text-sm font-bold text-white'
                  }
                >
                  1
                </span>
                Your payment was confirmed.
              </li>
              <li className="flex gap-3">
                <span
                  className={
                    isNovaLife
                      ? 'grid h-6 w-6 shrink-0 place-items-center rounded-full bg-nova-gold text-sm font-bold text-nova-navyDeep'
                      : 'grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand-500 text-sm font-bold text-white'
                  }
                >
                  2
                </span>
                {isTestCheckout
                  ? `Stripe recorded test payment ${orderId}.`
                  : `Order reference ${orderId} was created.`}
              </li>
            </ol>
            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              {statusOrderId && !isTestCheckout && (
                <Link
                  href={`/order/${statusOrderId}`}
                  className={isNovaLife ? novaButtonClass : primaryButtonClass}
                >
                  Track your order
                </Link>
              )}
              <Link
                href="/"
                className={isNovaLife ? novaButtonClass : primaryButtonClass}
              >
                Continue
              </Link>
              {display.returnUrl && (
                <a href={display.returnUrl} className={secondaryButtonClass}>
                  Back
                </a>
              )}
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main
      className={`min-h-screen ${isNovaLife ? 'bg-nova-off' : 'bg-cream'} py-12 sm:py-16 ${shellClass}`}
    >
      <div className="mx-auto w-full max-w-xl px-5 sm:px-6">
        <div className="text-center">
          {isNovaLife && (
            <span className="mb-4 inline-flex items-center gap-2.5 text-xs font-extrabold uppercase tracking-[0.3em] text-nova-gold">
              <span className="inline-block h-px w-6 bg-nova-gold" />
              Secure Payment
            </span>
          )}
          <h1
            className={
              isNovaLife
                ? `text-4xl font-extrabold tracking-tight text-nova-navy sm:text-5xl ${shellClass}`
                : `text-4xl font-medium tracking-tight text-ink sm:text-5xl ${serifClass}`
            }
          >
            Secure checkout
          </h1>
          <p
            className={`mt-4 text-lg leading-relaxed ${isNovaLife ? 'text-nova-inkSoft' : 'text-muted'}`}
          >
            Complete your order.
          </p>
        </div>

        <div
          className={
            isNovaLife
              ? 'relative mt-10 overflow-hidden rounded-2xl border border-nova-border bg-white p-6 shadow-[0_24px_60px_rgba(10,47,107,0.09)] sm:p-10'
              : 'mt-10 rounded-lg border border-line bg-white p-6 shadow-sm sm:p-10'
          }
        >
          {isNovaLife && (
            <span className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-nova-goldLight to-nova-gold" />
          )}

          {isNovaLife ? (
            <div className="flex items-start gap-4">
              <span className="grid h-[54px] w-[54px] shrink-0 place-items-center rounded-full bg-nova-navy text-white shadow-[0_14px_26px_rgba(10,47,107,0.22)]">
                <Lock size={18} />
              </span>
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-nova-gold">
                  Encrypted checkout
                </p>
                <h2 className="text-[22px] font-extrabold text-nova-navy">
                  Review your order
                </h2>
              </div>
            </div>
          ) : (
            <h2 className={`text-2xl font-medium text-ink ${serifClass}`}>
              Complete your order
            </h2>
          )}

          <div
            className={
              isNovaLife
                ? 'mt-5 space-y-4 rounded-lg bg-nova-off p-4 text-sm'
                : 'mt-5 space-y-4 rounded-lg bg-cream p-4 text-sm'
            }
          >
            <div className="flex items-center gap-4 text-left">
              <span className="relative block h-20 w-16 shrink-0 overflow-hidden rounded-md shadow-sm">
                <Image
                  src={display.image}
                  alt={display.title}
                  fill
                  priority
                  sizes="64px"
                  className="object-cover"
                />
              </span>
              <span>
                <span
                  className={`block text-xs font-bold uppercase tracking-wider ${isNovaLife ? 'text-nova-gold' : 'text-brand-600'}`}
                >
                  Matched to your order
                </span>
                <span
                  className={`mt-1 block text-lg font-semibold ${isNovaLife ? 'text-nova-navy' : 'text-ink'}`}
                >
                  {display.title}
                </span>
                <span
                  className={`block text-sm ${isNovaLife ? 'text-nova-inkSoft' : 'text-muted'}`}
                >
                  {session
                    ? formatAmount(session.amount, session.currency)
                    : display.previewAmount !== undefined
                      ? formatAmount(
                          display.previewAmount,
                          display.currency ?? 'usd',
                        )
                      : 'Final total from Medusa'}
                </span>
              </span>
            </div>

            <div
              className={`space-y-2 border-t pt-3 ${isNovaLife ? 'border-nova-border' : 'border-line'}`}
            >
              {display.items?.length ? (
                display.items.map((item, index) => (
                  <div
                    key={`${item.id}-${index}`}
                    className="flex items-center justify-between gap-3"
                  >
                    <span className={isNovaLife ? 'text-nova-inkSoft' : 'text-muted'}>
                      {item.name}
                      {item.quantity > 1 ? ` × ${item.quantity}` : ''}
                    </span>
                    <span
                      className={`font-semibold ${isNovaLife ? 'text-nova-navy' : 'text-ink'}`}
                    >
                      {formatCents(item.lineTotal, display.currency ?? 'usd')}
                    </span>
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-between">
                  <span className={isNovaLife ? 'text-nova-inkSoft' : 'text-muted'}>
                    {display.lineItemLabel}
                  </span>
                  <span
                    className={`font-semibold ${isNovaLife ? 'text-nova-navy' : 'text-ink'}`}
                  >
                    {session
                      ? formatAmount(session.amount, session.currency)
                      : 'Review'}
                  </span>
                </div>
              )}
              <div
                className={`flex items-center justify-between border-t pt-2 text-base ${isNovaLife ? 'border-nova-border' : 'border-line'}`}
              >
                <span
                  className={`font-semibold ${isNovaLife ? 'text-nova-navy' : 'text-ink'}`}
                >
                  Due today
                </span>
                <span
                  className={`font-bold ${isNovaLife ? 'text-nova-gold' : 'text-brand-700'}`}
                >
                  {session
                    ? formatAmount(session.amount, session.currency)
                    : display.previewAmount !== undefined
                      ? formatAmount(
                          display.previewAmount,
                          display.currency ?? 'usd',
                        )
                      : 'After setup'}
                </span>
              </div>
            </div>
          </div>

          {!session && requiresHandoff && (
            <p
              className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700"
              role="alert"
            >
              Return to VelluraCare and start secure checkout again.
            </p>
          )}

          {!session && handoffToken && (
            <div className="mt-6 space-y-4">
              {(handoffLoading || loading) && (
                <p
                  className={
                    isNovaLife
                      ? 'rounded-lg bg-nova-off px-4 py-3 text-sm font-semibold text-nova-navy'
                      : 'rounded-lg bg-brand-50 px-4 py-3 text-sm font-semibold text-brand-800'
                  }
                >
                  Setting up checkout...
                </p>
              )}
              {(handoffError || error) && (
                <p
                  className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700"
                  role="alert"
                >
                  {handoffError || error}
                </p>
              )}
            </div>
          )}

          {!session && !handoffToken && !requiresHandoff && (
            <form
              className="mt-6 space-y-5"
              onSubmit={(event) => {
                event.preventDefault();
                void startCheckout();
              }}
            >
              <div>
                <label
                  htmlFor="checkoutEmail"
                  className={`mb-1.5 block text-base font-semibold ${isNovaLife ? 'text-nova-navy' : 'text-ink'}`}
                >
                  Email
                </label>
                <input
                  id="checkoutEmail"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className={
                    isNovaLife
                      ? 'w-full rounded-lg border border-nova-border bg-white px-4 py-3.5 text-base text-nova-navy placeholder:text-nova-inkSoft/70 focus-visible:outline-2 focus-visible:outline-nova-gold'
                      : inputClass
                  }
                  placeholder="you@example.com"
                />
              </div>
              {error && (
                <p
                  className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700"
                  role="alert"
                >
                  {error}
                </p>
              )}
              <button
                type="submit"
                className={`${isNovaLife ? novaButtonClass : primaryButtonClass} w-full`}
                disabled={loading}
                >
                {loading
                  ? 'Setting up checkout...'
                  : 'Continue to secure checkout'}
              </button>
            </form>
          )}

          {session && !stripePromise && (
            <p className="mt-6 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Payments are not configured. Set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
              in Satielle.
            </p>
          )}

          {session && stripePromise && (
            <div className="mt-6">
              <Elements
                stripe={stripePromise}
                options={{
                  clientSecret: session.clientSecret,
                  appearance: { theme: 'stripe' },
                }}
              >
                <PaymentForm
                  session={session}
                  analyticsSource={display.source}
                  analyticsTitle={display.title}
                  customerName={handoff?.customerName}
                  isNovaLife={isNovaLife}
                  onSuccess={setOrderId}
                />
              </Elements>
            </div>
          )}

          <p
            className={`mt-5 flex items-start gap-2 text-sm ${isNovaLife ? 'text-nova-inkSoft' : 'text-muted'}`}
          >
            <ShieldCheck
              size={15}
              className={`mt-0.5 shrink-0 ${isNovaLife ? 'text-nova-gold' : 'text-brand-500'}`}
            />
            Your payment is processed through Stripe&apos;s encrypted form.
          </p>
        </div>
      </div>
    </main>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <main
          className={`grid min-h-screen place-items-center bg-cream text-ink ${shellClass}`}
        >
          <p className="text-sm font-semibold uppercase tracking-wider">
            Loading checkout
          </p>
        </main>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
