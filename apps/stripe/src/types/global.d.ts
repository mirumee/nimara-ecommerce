export {};

declare global {
  // Client output directory, relative to the built server bundle. See `BUILD_TARGET`.
  const __CLIENT_ASSETS_DIR__: string;

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
