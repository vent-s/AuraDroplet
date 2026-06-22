# AuraDroplet

AuraDroplet is now the shared Medusa checkout frontend for AuraDroplet and
VelluraCare.

## Checkout Flow

- AuraDroplet product buttons link directly to `/checkout?source=auradroplet`.
- VelluraCare posts checkout context to AuraDroplet's
  `/api/checkout-handoff` route and sends the browser to
  `/checkout?handoff=ho_...`.
- AuraDroplet creates the Medusa cart server-side through `/api/medusa-checkout`.
- Stripe Elements collects card details on the AuraDroplet checkout page.
- After Stripe confirms payment, AuraDroplet calls Medusa to complete the cart.

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
AURADROPLET_MEDUSA_VARIANT_ID=
VELLURACARE_MEDUSA_VARIANT_ID=
CHECKOUT_HANDOFF_TTL_SECONDS=900
```

The backend seed creates `aura-diffuser-kit` at `$200`. If the Railway database
already exists, create that product in Medusa Admin or run the seed/migration
against the production database before turning on the AuraDroplet checkout.
