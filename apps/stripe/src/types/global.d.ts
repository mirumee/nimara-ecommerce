/// <reference types="@nimara/lib/types/hono" />
/// <reference types="@nimara/lib/types/vite-env" />

export {};

declare global {
  const __BUILD_TARGET__: "node" | "vercel";

  // Built client assets as base64, keyed by file name. See `@nimara/tooling/build`.
  const __CLIENT_ASSETS__: Record<string, string>;

  interface Window {
    // Injected into the served HTML by `clientEntryPoint`.
    env: { BASE_PATH: string; VERSION: string };
  }
}
