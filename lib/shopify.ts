const SHOPIFY_API_VERSION = "2024-10";

const storeDomain = process.env.SHOPIFY_STORE_DOMAIN;
const storefrontToken = process.env.SHOPIFY_STOREFRONT_TOKEN;

const endpoint = storeDomain
  ? `https://${storeDomain}/api/${SHOPIFY_API_VERSION}/graphql.json`
  : undefined;

type Variables = Record<string, unknown> | undefined;

type ShopifyResponse<T> = {
  data?: T;
  errors?: Array<{ message: string }>;
};

export async function shopifyFetch<T>(query: string, variables?: Variables): Promise<ShopifyResponse<T>> {
  if (!endpoint || !storefrontToken) {
    throw new Error("Missing Shopify configuration. Ensure STORE_DOMAIN and STOREFRONT_TOKEN are set.");
  }

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Shopify-Storefront-Private-Token": storefrontToken,
    },
    body: JSON.stringify({ query, variables }),
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Shopify error ${res.status}: ${text}`);
  }

  return res.json();
}

export const GQL = {
  productByHandle: `
    query ProductByHandle($handle: String!) {
      product(handle: $handle) {
        id
        title
        variants(first: 10) {
          nodes {
            id
            title
            availableForSale
          }
        }
      }
    }
  `,
  cartCreate: `
    mutation CartCreate($lines: [CartLineInput!]) {
      cartCreate(input: { lines: $lines }) {
        cart {
          id
          checkoutUrl
        }
        userErrors {
          field
          message
        }
      }
    }
  `,
  cartLinesAdd: `
    mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
      cartLinesAdd(cartId: $cartId, lines: $lines) {
        cart {
          id
          checkoutUrl
        }
        userErrors {
          field
          message
        }
      }
    }
  `,
};
