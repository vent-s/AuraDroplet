const SHOPIFY_API_VERSION = "2024-10";

const storeDomain = process.env.SHOPIFY_STORE_DOMAIN;
const storefrontToken = process.env.SHOPIFY_STOREFRONT_TOKEN;

const endpoint = storeDomain
  ? `https://${storeDomain}/api/${SHOPIFY_API_VERSION}/graphql.json`
  : undefined;

// Log configuration for debugging (remove in production)
if (process.env.NODE_ENV === 'development') {
  console.log('Shopify Config:', {
    domain: storeDomain,
    endpoint,
    hasToken: !!storefrontToken,
  });
}

type Variables = Record<string, unknown> | undefined;

type ShopifyResponse<T> = {
  data?: T;
  errors?: Array<{ message: string }>;
};

export async function shopifyFetch<T>(query: string, variables?: Variables): Promise<ShopifyResponse<T>> {
  if (!endpoint || !storefrontToken) {
    throw new Error("Missing Shopify configuration. Ensure STORE_DOMAIN and STOREFRONT_TOKEN are set.");
  }

  console.log('Making Shopify request to:', endpoint);
  console.log('With variables:', JSON.stringify(variables, null, 2));

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": storefrontToken,
    },
    body: JSON.stringify({ query, variables }),
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    const text = await res.text();
    console.error('Shopify API Error:', res.status, text);
    throw new Error(`Shopify error ${res.status}: ${text}`);
  }

  const jsonResponse = await res.json();
  console.log('Shopify response:', JSON.stringify(jsonResponse, null, 2));

  return jsonResponse;
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
