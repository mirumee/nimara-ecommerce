import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Logger } from "@nimara/infrastructure/logging/types";
import { createSearchService } from "@nimara/infrastructure/search/select";

const envMock = {
  SEARCH_SERVICE: "saleor",
  CMS_SERVICE: "saleor",
  ENVIRONMENT: "LOCAL",
};
const saleorMock = { configured: true };

vi.mock("@/envs/client", () => ({ clientEnvs: envMock }));
vi.mock("@/services/lazy-loaders/empty-services", () => ({
  get isSaleorConfigured() {
    return saleorMock.configured;
  },
}));

const { resolveSearchProvider, resolveCMSProvider } =
  await import("../resolve");

const fakeLogger = {
  debug: vi.fn(),
  info: vi.fn(),
  warning: vi.fn(),
  error: vi.fn(),
  critical: vi.fn(),
} satisfies Logger;

describe("integration resolvers", () => {
  beforeEach(() => {
    envMock.SEARCH_SERVICE = "saleor";
    envMock.CMS_SERVICE = "saleor";
    envMock.ENVIRONMENT = "LOCAL";
    saleorMock.configured = true;
  });

  it("defaults to saleor when it is configured", () => {
    expect(resolveSearchProvider()).toBe("saleor");
    expect(resolveCMSProvider()).toBe("saleor");
  });

  it("returns the selected non-default provider", () => {
    envMock.SEARCH_SERVICE = "algolia";
    envMock.CMS_SERVICE = "butter-cms";

    expect(resolveSearchProvider()).toBe("algolia");
    expect(resolveCMSProvider()).toBe("butter-cms");
  });

  it("falls back to dummy when saleor is unconfigured outside production", () => {
    saleorMock.configured = false;

    expect(resolveSearchProvider()).toBe("dummy");
    expect(resolveCMSProvider()).toBe("dummy");
  });

  it("falls back to empty (null) when saleor is unconfigured in production", () => {
    saleorMock.configured = false;
    envMock.ENVIRONMENT = "PRODUCTION";

    expect(resolveSearchProvider()).toBeNull();
    expect(resolveCMSProvider()).toBeNull();
  });

  it("keeps a non-saleor provider even when saleor is unconfigured", () => {
    saleorMock.configured = false;
    envMock.SEARCH_SERVICE = "algolia";
    envMock.CMS_SERVICE = "butter-cms";

    expect(resolveSearchProvider()).toBe("algolia");
    expect(resolveCMSProvider()).toBe("butter-cms");
  });
});

describe("createSearchService", () => {
  it("rejects when the selected provider's config is missing", async () => {
    // Algolia ships unconfigured by default — selecting it without credentials
    // must fail fast rather than return an empty service.
    await expect(
      createSearchService("algolia", { logger: fakeLogger }),
    ).rejects.toThrow(/algolia/i);
  });

  it("builds the dummy provider with no extra config", async () => {
    await expect(
      createSearchService("dummy", { logger: fakeLogger }),
    ).resolves.toBeTruthy();
  });
});
