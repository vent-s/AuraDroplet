# Satielle

Satielle is now the shared Medusa checkout frontend for Satielle and
VelluraCare.

## Checkout Flow

- Satielle product buttons link directly to `/checkout?source=satielle`.
- VelluraCare posts checkout context to Satielle's
  `/api/checkout-handoff` route and sends the browser to
  `/checkout?handoff=ho_...`.
- Satielle creates the Medusa cart server-side through `/api/medusa-checkout`.
- Stripe Elements collects card details on the Satielle checkout page.
- After Stripe confirms payment, Satielle calls Medusa to complete the cart.

This uses normal same-tab navigation. No popups, hidden windows, iframes around
third-party pages, raw card fields, or PII checkout query strings are used.

## Environment

```text
MEDUSA_BACKEND_URL=https://your-medusa-backend.up.railway.app
MEDUSA_PUBLISHABLE_KEY=pk_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
CHECKOUT_HANDOFF_SECRET=use-the-same-random-secret-as-velluracare

# Production token storage. Local development falls back to memory.
KV_REST_API_URL=
KV_REST_API_TOKEN=
# or
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Optional variant pins
SATIELLE_MEDUSA_VARIANT_ID=
RETATRUTIDE_MEDUSA_VARIANT_ID=
SEMAGLUTIDE_MEDUSA_VARIANT_ID=
TIRZEPATIDE_MEDUSA_VARIANT_ID=

# Legacy semaglutide fallback
VELLURACARE_MEDUSA_VARIANT_ID=
CHECKOUT_HANDOFF_TTL_SECONDS=900
```

The backend seed creates `satielle-diffuser-kit` at `$200` and the VelluraCare
weight-management products. If the Railway database already exists, create those
products in Medusa Admin or run the seed/migration against the production
database before turning on the Satielle checkout.
