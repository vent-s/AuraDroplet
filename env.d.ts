declare namespace NodeJS {
  interface ProcessEnv {
    MEDUSA_BACKEND_URL: string;
    MEDUSA_PUBLISHABLE_KEY: string;
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: string;
    CHECKOUT_HANDOFF_SECRET?: string;
    CHECKOUT_HANDOFF_TTL_SECONDS?: string;
    KV_REST_API_URL?: string;
    KV_REST_API_TOKEN?: string;
    UPSTASH_REDIS_REST_URL?: string;
    UPSTASH_REDIS_REST_TOKEN?: string;
    AURADROPLET_MEDUSA_VARIANT_ID?: string;
    VELLURACARE_MEDUSA_VARIANT_ID?: string;
  }
}
