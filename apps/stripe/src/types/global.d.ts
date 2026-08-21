export {};

declare global {
  const __BUILD_TARGET__: "node" | "vercel";

  // Built client assets as base64, keyed by file name. See `etc/build.ts`.
  const __CLIENT_ASSETS__: Record<string, string>;

  interface Window {
    // Injected into the served HTML by `clientEntryPoint`.
    env: { BASE_PATH: string; VERSION: string };
  }

  // Dev-only credentials for running the config UI outside the Dashboard.
  interface ImportMetaEnv {
    readonly VITE_SALEOR_API_URL?: string;
    readonly VITE_SALEOR_APP_TOKEN?: string;
  }
}
