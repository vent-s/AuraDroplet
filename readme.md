1) What you’ll use (simple + fast)

Shopify hosted checkout (PCI, tax, shipping, Shop Pay).

Storefront API (GraphQL) to make a cart and get a checkoutUrl.

Optional: Cart permalinks for true one-click links (no server hop).

Webhooks to track orders and inventory events.

Next.js (App Router) for a minimal server (or Hydrogen—mechanics are the same).

2) Shopify admin setup (once)

Create product: AURADroplet with at least one variant (e.g., “Standard / White”).

Enable payments: Shopify Payments + Shop Pay.

Shipping / tax: set rates and tax settings.

Create a Custom app (Settings → Apps → Develop apps):

Enable Storefront API (read products, read/inventory, write cart).

Optional: Enable Admin API if you’ll sync stock or do back-office tasks.

Copy:

Storefront access token

Admin access token (only if needed)

Note your store domain: your-shop.myshopify.com.

3) Environment variables

Drop the provided `.env.example` into `.env.local` and fill in real values (or set them directly in Vercel / your host):

```
SHOPIFY_STORE_DOMAIN=your-shop.myshopify.com
SHOPIFY_STOREFRONT_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxx
SHOPIFY_ADMIN_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxx      # only if you use Admin API
SHOPIFY_WEBHOOK_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxx    # “Webhook signing secret”
NEXT_PUBLIC_SHOPIFY_VARIANT_ID=gid://shopify/ProductVariant/1234567890
```

These are mirrored in `env.d.ts`, so TypeScript will yell if you forget one.

### Deploying to Vercel

1. Install the CLI and link the project: `npm i -g vercel && vercel link`.
2. Push your repo to GitHub (already done) and import it in the Vercel dashboard – framework will auto-detect as Next.js.
3. Add the environment variables above for each environment (`Production`, `Preview`, `Development`). CLI shortcut:

   ```bash
   vercel env add SHOPIFY_STORE_DOMAIN production
   vercel env add SHOPIFY_STOREFRONT_TOKEN production
   vercel env add NEXT_PUBLIC_SHOPIFY_VARIANT_ID production
   vercel env add SHOPIFY_WEBHOOK_SECRET production
   # repeat for preview if needed
   ```

4. Pull them locally so `next dev` matches Vercel: `vercel env pull .env.local`.
5. Deploy straight from the terminal whenever you’re ready: `vercel --prod` (or rely on GitHub pushes to main).

The API routes inside `app/api/**` automatically become Vercel Serverless Functions. They already call the Shopify Storefront API via `lib/shopify.ts`, so as long as your tokens exist the quick checkout + webhook flow will work with zero extra config.

4) Fastest checkout from a bare link (no code)

If you already know your variant ID (the numeric one), you can send people straight to checkout from a hero button, an IG bio, an email, anything:

https://your-shop.myshopify.com/cart/VARIANT_ID:1?checkout[shipping_address][first_name]=


You can add multiple items: /cart/ID1:1,ID2:2.

Add a discount: &discount=WELCOME10.

This is the absolute fastest path—no server, instant checkout page.

Use this if you only sell AURADroplet or have a very simple funnel.

5) Headless quick-checkout API (recommended)

For more control (tracking, bundles, geo, etc.), create a cart server-side and 302-redirect to checkoutUrl.

/lib/shopify.ts – tiny Storefront client
// lib/shopify.ts
const endpoint = `https://${process.env.SHOPIFY_STORE_DOMAIN}/api/2024-10/graphql.json`;

export async function shopifyFetch<T>(query: string, variables?: Record<string, any>): Promise<T> {
  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Shopify-Storefront-Private-Token": process.env.SHOPIFY_STOREFRONT_TOKEN!, // Storefront private token
    },
    body: JSON.stringify({ query, variables }),
    // Important for performance on Vercel/Netlify
    next: { revalidate: 60 },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Shopify error ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

export const GQL = {
  productByHandle: `
    query ProductByHandle($handle: String!) {
      product(handle: $handle) {
        id
        title
        variants(first: 10) { nodes { id title availableForSale } }
      }
    }
  `,
  cartCreate: `
    mutation CartCreate($lines: [CartLineInput!]) {
      cartCreate(input: { lines: $lines }) {
        cart { id checkoutUrl }
        userErrors { field message }
      }
    }
  `,
  cartLinesAdd: `
    mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
      cartLinesAdd(cartId: $cartId, lines: $lines) {
        cart { id checkoutUrl }
        userErrors { field message }
      }
    }
  `
};

/app/api/quick-checkout/route.ts – one-tap redirect
// app/api/quick-checkout/route.ts (Next.js App Router)
import { NextRequest, NextResponse } from "next/server";
import { shopifyFetch, GQL } from "@/lib/shopify";

// URL format: /api/quick-checkout?variant=gid://shopify/ProductVariant/123456789&qty=1
export async function GET(req: NextRequest) {
  const variant = req.nextUrl.searchParams.get("variant");
  const qty = parseInt(req.nextUrl.searchParams.get("qty") ?? "1", 10);
  if (!variant) return NextResponse.json({ error: "Missing variant" }, { status: 400 });

  const { data } = await shopifyFetch<any>(GQL.cartCreate, {
    lines: [{ merchandiseId: variant, quantity: Math.max(1, qty) }],
  });

  const url = data?.cartCreate?.cart?.checkoutUrl;
  if (!url) return NextResponse.json({ error: "Unable to create checkout" }, { status: 500 });

  // Optional: append discount or tracking params here
  // const urlWithParams = new URL(url); urlWithParams.searchParams.set('discount', 'WELCOME10');

  return NextResponse.redirect(url, 302);
}


How you use it on the page (hero CTA):

<a href="/api/quick-checkout?variant=GID_VARIANT&qty=1" class="btn-buy">BUY NOW</a>


Get GID_VARIANT once via the Product query or the Shopify Admin (GraphQL ID looks like gid://shopify/ProductVariant/1234567890).

This hits your serverless route, creates a Cart, and sends the buyer to Shopify’s one-page checkout with Shop Pay.

6) Optional: get variant ID by handle (server)

If you don’t want to hardcode a variant ID:

// app/api/variant-by-handle/route.ts
import { NextRequest, NextResponse } from "next/server";
import { shopifyFetch, GQL } from "@/lib/shopify";

export async function GET(req: NextRequest) {
  const handle = req.nextUrl.searchParams.get("handle") || "auradroplet";
  const { data } = await shopifyFetch<any>(GQL.productByHandle, { handle });
  const variant = data?.product?.variants?.nodes?.find((v: any) => v.availableForSale);
  if (!variant) return NextResponse.json({ error: "No variant available" }, { status: 404 });
  return NextResponse.json({ variantId: variant.id });
}

7) Webhooks (orders, refunds, inventory)

Verify HMAC → update your CRM, email list, analytics, etc.

// app/api/webhooks/shopify/route.ts
import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";

function verify(req: NextRequest, body: string) {
  const hmac = req.headers.get("x-shopify-hmac-sha256") || "";
  const digest = crypto
    .createHmac("sha256", process.env.SHOPIFY_WEBHOOK_SECRET!)
    .update(body, "utf8")
    .digest("base64");
  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(hmac));
}

export async function POST(req: NextRequest) {
  const raw = await req.text();
  if (!verify(req, raw)) return NextResponse.json({ ok: false }, { status: 401 });

  const topic = req.headers.get("x-shopify-topic");
  const payload = JSON.parse(raw);

  // Example: handle order creation
  if (topic === "orders/create") {
    // upsert to your DB, fire Slack, etc.
  }

  return NextResponse.json({ ok: true });
}


Subscribe in Shopify Admin → Settings → Notifications → Webhooks
Recommended topics: orders/create, orders/paid, orders/fulfilled, refunds/create, inventory_levels/update.

8) Mobile-friendly + speed (what matters)

Let Shopify do the heavy lifting: always redirect to checkoutUrl.

Add Shop Pay dynamic checkout buttons if you also use a Shopify theme page.

Cache catalog calls (revalidate: 60) and serve static hero assets via Shopify CDN or your host’s CDN.

Keep landing < 100KB CSS/JS; no carousels or heavy JS.

Use Link → Checkout (see §4/§5) so users skip the cart entirely.

9) Analytics & pixels (server + checkout)

Add your Shopify Pixels (Meta/GA4/TikTok) from Shopify Admin so they fire in checkout (your custom site won’t see the checkout DOM).

From your site, fire server events when you call /api/quick-checkout (e.g., log begin_checkout) so channels attribute correctly.

10) Extras you likely want (backend bits)

Rate limiting the API routes (to stop bot spam on quick-checkout).

Geo/locale: inspect Accept-Language/IP and choose correct variant or shipping note.

Discount logic: add ?discount=... to the checkoutUrl.

Bundle/upsell: add multiple lines in cartCreate.

Inventory gate: read variant availability and hide “Buy Now” if availableForSale = false.

Sitemaps & SEO: static sitemap for landing, product structured data (JSON-LD).

Email capture: pre-checkout (Shopify handles transactional emails).

11) If you prefer Hydrogen (Shopify’s Remix)

Everything above maps 1:1. Use @shopify/hydrogen and the cartCreate/cartLinesAdd actions, then redirect(cart.checkoutUrl) in an action. Same tokens/env.

TL;DR (your fastest path)

Simplest: Put this link on the hero “BUY NOW” button:
https://your-shop.myshopify.com/cart/VARIANT_ID:1 → lands on checkout instantly.

Best-practice: Use the /api/quick-checkout route above, which creates a cart server-side, adds AURADroplet, and 302s to Shopify’s one-page checkout with Shop Pay.

If you want, I can turn this into a tiny Next.js repo with the routes wired and a hero page that matches your first image but swaps in the AURADroplet shot, plus the “Buy Now” link prefilled for checkout.

Extended thinking
ChatGPT can make mistakes. Check important info.
