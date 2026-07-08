import { randomBytes, timingSafeEqual } from "crypto";

export type VelluraProductHandle =
  | "retatrutide-injection"
  | "semaglutide-injection"
  | "tirzepatide-injection";

/** One line of a cart-style handoff. Amounts are integer cents. */
export interface HandoffItem {
  id: string;
  sku?: string;
  name: string;
  quantity: number;
  unitAmount: number;
  lineTotal: number;
}

export interface CheckoutHandoff {
  source: string;
  // Single-product (velluracare) handoffs:
  productHandle?: VelluraProductHandle;
  variantId?: string;
  // Cart handoffs (novalife.science and other storefronts). When `items` is
  // present the checkout charges `cartTotal` directly through Stripe instead
  // of building a Medusa cart.
  items?: HandoffItem[];
  currency?: string;
  cartTotal?: number;
  cancelUrl?: string;
  email?: string;
  customerName?: string;
  posthogDistinctId?: string;
  returnUrl?: string;
  createdAt: number;
  expiresAt: number;
}

const HANDOFF_PREFIX = "checkout_handoff:";
const DEFAULT_TTL_SECONDS = 15 * 60;
const TOKEN_PATTERN = /^ho_[A-Za-z0-9_-]{32,}$/;

const PRODUCT_TITLES: Record<VelluraProductHandle, string> = {
  "retatrutide-injection": "Retatrutide Injection",
  "semaglutide-injection": "Semaglutide Injection",
  "tirzepatide-injection": "Tirzepatide Injection",
};

type StoreMap = Map<string, string>;
type GlobalWithStore = typeof globalThis & {
  __satielleCheckoutHandoffs?: StoreMap;
};

function ttlSeconds() {
  const value = Number(process.env.CHECKOUT_HANDOFF_TTL_SECONDS);
  return Number.isFinite(value) && value > 0 ? value : DEFAULT_TTL_SECONDS;
}

function getMemoryStore(): StoreMap {
  const globalStore = globalThis as GlobalWithStore;
  globalStore.__satielleCheckoutHandoffs ??= new Map<string, string>();
  return globalStore.__satielleCheckoutHandoffs;
}

function kvConfig() {
  const url =
    process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token =
    process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  return url && token ? { url, token } : null;
}

async function kvCommand<T>(command: unknown[]): Promise<T | null> {
  const config = kvConfig();
  if (!config) return null;

  const response = await fetch(config.url, {
    method: "POST",
    headers: {
      authorization: `Bearer ${config.token}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(command),
    cache: "no-store",
  });
  const body = (await response.json().catch(() => ({}))) as {
    result?: T;
    error?: string;
  };

  if (!response.ok || body.error) {
    throw new Error(body.error || "Checkout handoff storage failed.");
  }

  return body.result ?? null;
}

async function setStoredValue(
  key: string,
  value: string,
  ttl: number,
): Promise<void> {
  const stored = await kvCommand<string>(["SET", key, value, "EX", ttl]);
  if (stored !== null) return;

  const memory = getMemoryStore();
  memory.set(key, value);
}

async function getStoredValue(key: string): Promise<string | null> {
  const stored = await kvCommand<string>(["GET", key]);
  if (stored !== null) return stored;

  return getMemoryStore().get(key) ?? null;
}

async function deleteStoredValue(key: string): Promise<void> {
  const deleted = await kvCommand<number>(["DEL", key]);
  if (deleted !== null) return;

  getMemoryStore().delete(key);
}

function normalizeEmail(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.trim().toLowerCase();
}

function normalizeText(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const normalized = value.trim().replace(/\s+/g, " ");
  return normalized || undefined;
}

function normalizeReturnUrl(value: unknown): string | undefined {
  const url = normalizeText(value);
  if (!url) return undefined;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" || parsed.protocol === "http:"
      ? parsed.toString()
      : undefined;
  } catch {
    return undefined;
  }
}

function normalizeProductHandle(value: unknown): VelluraProductHandle {
  if (value === "tirzepatide-injection") return "tirzepatide-injection";
  if (value === "semaglutide-injection") return "semaglutide-injection";
  return "retatrutide-injection";
}

function normalizeCents(value: unknown): number {
  const cents = Math.round(Number(value));
  return Number.isFinite(cents) && cents > 0 ? cents : 0;
}

function normalizeItems(value: unknown): HandoffItem[] {
  if (!Array.isArray(value)) return [];

  const items: HandoffItem[] = [];
  for (const raw of value.slice(0, 50)) {
    if (typeof raw !== "object" || raw === null) continue;
    const item = raw as Record<string, unknown>;
    const name = normalizeText(item.name);
    const quantity = Math.min(Math.max(Math.round(Number(item.quantity)) || 0, 0), 99);
    const unitAmount = normalizeCents(item.unitAmount);
    const lineTotal = normalizeCents(item.lineTotal) || unitAmount * quantity;
    if (!name || quantity < 1 || lineTotal < 1) continue;
    items.push({
      id: normalizeText(item.id) ?? "",
      sku: normalizeText(item.sku),
      name,
      quantity,
      unitAmount: unitAmount || Math.round(lineTotal / quantity),
      lineTotal,
    });
  }
  return items;
}

function normalizeCurrency(value: unknown): string {
  const currency = normalizeText(value)?.toLowerCase();
  return currency && /^[a-z]{3}$/.test(currency) ? currency : "usd";
}

function normalizeSource(value: unknown): string {
  const source = normalizeText(value)?.toLowerCase();
  return source && /^[a-z0-9.-]{1,64}$/.test(source) ? source : "velluracare";
}

export function handoffProductTitle(handle: VelluraProductHandle): string {
  return PRODUCT_TITLES[handle];
}

export function handoffTitle(handoff: CheckoutHandoff): string {
  if (handoff.items?.length) {
    const count = handoff.items.reduce((sum, item) => sum + item.quantity, 0);
    const label = count === 1 ? "item" : "items";
    return handoff.source === "novalife.science"
      ? `NovaLife Science order (${count} ${label})`
      : `${handoff.source} order (${count} ${label})`;
  }
  return PRODUCT_TITLES[handoff.productHandle ?? "retatrutide-injection"];
}

export function isAuthorizedHandoffRequest(request: Request): boolean {
  const secret = process.env.CHECKOUT_HANDOFF_SECRET;
  if (!secret) return process.env.NODE_ENV !== "production";

  const header = request.headers.get("authorization") || "";
  const supplied = header.replace(/^Bearer\s+/i, "");
  const expected = Buffer.from(secret);
  const actual = Buffer.from(supplied);

  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export async function createCheckoutHandoff(input: {
  source?: unknown;
  productHandle?: unknown;
  variantId?: unknown;
  items?: unknown;
  currency?: unknown;
  cartTotal?: unknown;
  cancelUrl?: unknown;
  email?: unknown;
  customerName?: unknown;
  posthogDistinctId?: unknown;
  returnUrl?: unknown;
}): Promise<{ token: string; handoff: CheckoutHandoff }> {
  const email = normalizeEmail(input.email);
  const items = normalizeItems(input.items);

  // Cart handoffs carry their own line items and totals; single-product
  // (velluracare) handoffs still require an email and a known product.
  if (!items.length && (!email || !email.includes("@"))) {
    throw new Error("A valid email is required.");
  }

  const now = Date.now();
  const ttl = ttlSeconds();
  const token = `ho_${randomBytes(24).toString("base64url")}`;

  const base = {
    email: email && email.includes("@") ? email : undefined,
    customerName: normalizeText(input.customerName),
    posthogDistinctId: normalizeText(input.posthogDistinctId),
    returnUrl: normalizeReturnUrl(input.returnUrl),
    createdAt: now,
    expiresAt: now + ttl * 1000,
  };

  const handoff: CheckoutHandoff = items.length
    ? {
        source: normalizeSource(input.source),
        items,
        currency: normalizeCurrency(input.currency),
        cartTotal:
          normalizeCents(input.cartTotal) ||
          items.reduce((sum, item) => sum + item.lineTotal, 0),
        cancelUrl: normalizeReturnUrl(input.cancelUrl),
        ...base,
      }
    : {
        source: "velluracare",
        productHandle: normalizeProductHandle(input.productHandle),
        variantId: normalizeText(input.variantId),
        ...base,
      };

  await setStoredValue(`${HANDOFF_PREFIX}${token}`, JSON.stringify(handoff), ttl);
  return { token, handoff };
}

export async function readCheckoutHandoff(
  token: string | undefined,
): Promise<CheckoutHandoff | null> {
  if (!token || !TOKEN_PATTERN.test(token)) return null;

  const key = `${HANDOFF_PREFIX}${token}`;
  const raw = await getStoredValue(key);
  if (!raw) return null;

  const handoff = JSON.parse(raw) as CheckoutHandoff;
  if (!handoff.expiresAt || handoff.expiresAt <= Date.now()) {
    await deleteStoredValue(key);
    return null;
  }

  return handoff;
}

export async function consumeCheckoutHandoff(
  token: string | undefined,
): Promise<void> {
  if (!token || !TOKEN_PATTERN.test(token)) return;
  await deleteStoredValue(`${HANDOFF_PREFIX}${token}`);
}
