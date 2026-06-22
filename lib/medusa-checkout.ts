import type { VelluraProductHandle } from "./checkout-handoff";

const BACKEND_URL = (
  process.env.MEDUSA_BACKEND_URL ?? "http://localhost:9000"
).replace(/\/+$/, "");
const PUBLISHABLE_KEY = process.env.MEDUSA_PUBLISHABLE_KEY;

type CheckoutProductKey = "satielle" | "velluracare";

interface MedusaCart {
  id: string;
  total: number;
  currency_code: string;
}

interface MedusaProduct {
  title: string;
  variants?: Array<{ id: string; title?: string | null }> | null;
}

interface ShippingOption {
  id: string;
  amount?: number | null;
}

interface PaymentSession {
  provider_id: string;
  data?: { client_secret?: string } | null;
}

interface PaymentCollection {
  id: string;
  payment_sessions?: PaymentSession[] | null;
}

interface CompleteResponse {
  type: "order" | "cart";
  order?: { id: string };
  error?: { message?: string };
}

export interface CheckoutSession {
  cartId: string;
  clientSecret: string;
  amount: number;
  currency: string;
}

export interface ShippingAddressInput {
  first_name: string;
  last_name: string;
  address_1: string;
  address_2?: string;
  city: string;
  province?: string;
  postal_code: string;
  country_code: string;
  phone?: string;
}

const PRODUCT_HANDLES: Record<CheckoutProductKey, string> = {
  satielle: "satielle-diffuser-kit",
  velluracare: "semaglutide-injection",
};

async function medusa<T>(path: string, init?: RequestInit): Promise<T> {
  if (!PUBLISHABLE_KEY) {
    throw new Error("Missing MEDUSA_PUBLISHABLE_KEY in Satielle.");
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const res = await fetch(`${BACKEND_URL}${normalizedPath}`, {
    ...init,
    headers: {
      "content-type": "application/json",
      "x-publishable-api-key": PUBLISHABLE_KEY,
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Medusa ${normalizedPath} -> ${res.status} ${body}`.trim());
  }

  return res.json() as Promise<T>;
}

async function getUsdRegionId(): Promise<string> {
  const { regions } = await medusa<{
    regions: { id: string; currency_code: string }[];
  }>("/store/regions");
  const usd = regions.find((r) => r.currency_code === "usd") ?? regions[0];
  if (!usd) throw new Error("Medusa has no regions configured.");
  return usd.id;
}

async function resolveVariantId(
  productKey: CheckoutProductKey,
  regionId: string,
  requestedVariantId?: string,
  requestedProductHandle?: VelluraProductHandle,
): Promise<string> {
  if (requestedVariantId) return requestedVariantId;

  const envVariant =
    productKey === "satielle"
      ? process.env.SATIELLE_MEDUSA_VARIANT_ID
      : process.env.VELLURACARE_MEDUSA_VARIANT_ID;

  if (envVariant) return envVariant;

  const handle = requestedProductHandle ?? PRODUCT_HANDLES[productKey];
  const { products } = await medusa<{ products: MedusaProduct[] }>(
    `/store/products?handle=${encodeURIComponent(handle)}&region_id=${regionId}`,
  );
  const variantId = products[0]?.variants?.[0]?.id;
  if (!variantId) {
    throw new Error(`No Medusa variant found for ${handle}.`);
  }
  return variantId;
}

export async function createCheckout({
  productKey,
  variantId,
  productHandle,
  email,
}: {
  productKey: CheckoutProductKey;
  variantId?: string;
  productHandle?: VelluraProductHandle;
  email: string;
}): Promise<CheckoutSession> {
  const regionId = await getUsdRegionId();
  const resolvedVariantId = await resolveVariantId(
    productKey,
    regionId,
    variantId,
    productHandle,
  );

  const { cart } = await medusa<{ cart: MedusaCart }>("/store/carts", {
    method: "POST",
    body: JSON.stringify({
      region_id: regionId,
      email,
      items: [{ variant_id: resolvedVariantId, quantity: 1 }],
    }),
  });

  const { shipping_options } = await medusa<{
    shipping_options: ShippingOption[];
  }>(`/store/shipping-options?cart_id=${cart.id}`);
  const option = [...shipping_options].sort(
    (a, b) => (a.amount ?? 0) - (b.amount ?? 0),
  )[0];
  if (!option) {
    throw new Error("No shipping option is available for this Medusa cart.");
  }

  const { cart: pricedCart } = await medusa<{ cart: MedusaCart }>(
    `/store/carts/${cart.id}/shipping-methods`,
    { method: "POST", body: JSON.stringify({ option_id: option.id }) },
  );

  const { payment_collection } = await medusa<{
    payment_collection: PaymentCollection;
  }>("/store/payment-collections", {
    method: "POST",
    body: JSON.stringify({ cart_id: pricedCart.id }),
  });

  const { payment_providers } = await medusa<{
    payment_providers: { id: string }[];
  }>(`/store/payment-providers?region_id=${regionId}`);
  const stripe = payment_providers.find((p) => p.id.includes("stripe"));
  if (!stripe) {
    throw new Error("Stripe is not enabled for the Medusa USD region.");
  }

  const { payment_collection: withSession } = await medusa<{
    payment_collection: PaymentCollection;
  }>(`/store/payment-collections/${payment_collection.id}/payment-sessions`, {
    method: "POST",
    body: JSON.stringify({ provider_id: stripe.id }),
  });

  const session =
    withSession.payment_sessions?.find((s) => s.provider_id === stripe.id) ??
    withSession.payment_sessions?.[0];
  const clientSecret = session?.data?.client_secret;
  if (!clientSecret) {
    throw new Error("Stripe did not return a client secret.");
  }

  return {
    cartId: pricedCart.id,
    clientSecret,
    amount: pricedCart.total,
    currency: pricedCart.currency_code,
  };
}

export async function setShippingAddress(
  cartId: string,
  address: ShippingAddressInput,
): Promise<void> {
  await medusa(`/store/carts/${cartId}`, {
    method: "POST",
    body: JSON.stringify({
      shipping_address: address,
      billing_address: address,
    }),
  });
}

export async function completeCheckout(
  cartId: string,
): Promise<{ orderId: string }> {
  const result = await medusa<CompleteResponse>(
    `/store/carts/${cartId}/complete`,
    { method: "POST" },
  );
  if (result.type !== "order" || !result.order) {
    throw new Error(result.error?.message ?? "Could not complete the order.");
  }
  return { orderId: result.order.id };
}
