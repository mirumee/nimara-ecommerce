import { afterEach, vi } from "vitest";

process.env.SALEOR_APP_TOKEN ??= "test-token";
process.env.STRIPE_SECRET_KEY ??= "test-key";

afterEach(() => {
  vi.restoreAllMocks();
});
