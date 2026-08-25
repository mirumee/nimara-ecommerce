export {};

declare global {
  // Dev-only credentials for running an app's UI outside the Dashboard.
  interface ImportMetaEnv {
    readonly VITE_SALEOR_API_URL?: string;
    readonly VITE_SALEOR_APP_TOKEN?: string;
  }
}
