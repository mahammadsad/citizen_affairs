/// <reference path="../.astro/types.d.ts" />
/// <reference types="@astrojs/image/client" />
/// <reference types="astro/client" />

declare namespace NodeJS {
  interface ProcessEnv {
    PUBLIC_SITE_URL: string;
    PUBLIC_BASE_PATH: string;
    PUBLIC_SUPABASE_URL: string;
    PUBLIC_SUPABASE_PUBLISHABLE_KEY: string;
  }
}
