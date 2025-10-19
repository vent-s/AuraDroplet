declare namespace NodeJS {
  interface ProcessEnv {
    SHOPIFY_STORE_DOMAIN: string;
    SHOPIFY_STOREFRONT_TOKEN: string;
    SHOPIFY_ADMIN_TOKEN?: string;
    SHOPIFY_WEBHOOK_SECRET?: string;
    NEXT_PUBLIC_SHOPIFY_VARIANT_ID?: string;
  }
}
