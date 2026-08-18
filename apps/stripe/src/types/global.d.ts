export {};

declare global {
  interface Window {
    // Injected into the served HTML by `clientEntryPoint`.
    env: { BASE_PATH: string; VERSION: string };
  }
}
