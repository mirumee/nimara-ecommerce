import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Logger } from "@nimara/infrastructure/logging/types";

const envMock = { SEARCH_SERVICE: "saleor", CMS_SERVICE: "saleor" };
const saleorMock = { configured: true };

vi.mock("@/envs/client", () => ({ clientEnvs: envMock }));
vi.mock("@/services/lazy-loaders/empty-services", () => ({
  get isSaleorConfigured() {
    return saleorMock.configured;
  },
}));

const { resolveSearchProvider, SEARCH_PROVIDERS } = await import("./search");
const { resolveCMSPageProvider } = await import("./cms-page");
const { resolveCMSMenuProvider } = await import("./cms-menu");

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
    saleorMock.configured = true;
  });

  it("defaults to saleor when it is configured", () => {
    expect(resolveSearchProvider()).toBe("saleor");
    expect(resolveCMSPageProvider()).toBe("saleor");
    expect(resolveCMSMenuProvider()).toBe("saleor");
  });

  it("returns the selected non-default provider", () => {
    envMock.SEARCH_SERVICE = "algolia";
    envMock.CMS_SERVICE = "butter-cms";

    expect(resolveSearchProvider()).toBe("algolia");
    expect(resolveCMSPageProvider()).toBe("butter-cms");
    expect(resolveCMSMenuProvider()).toBe("butter-cms");
  });

  it("falls back to empty (null) when saleor is selected but unconfigured", () => {
    saleorMock.configured = false;

    expect(resolveSearchProvider()).toBeNull();
    expect(resolveCMSPageProvider()).toBeNull();
    expect(resolveCMSMenuProvider()).toBeNull();
  });

  it("keeps a non-saleor provider even when saleor is unconfigured", () => {
    saleorMock.configured = false;
    envMock.SEARCH_SERVICE = "algolia";
    envMock.CMS_SERVICE = "butter-cms";

    expect(resolveSearchProvider()).toBe("algolia");
    expect(resolveCMSPageProvider()).toBe("butter-cms");
  });
});

describe("algolia search provider", () => {
  it("rejects with a clear error when no indices are configured", async () => {
    // ALGOLIA_INDICES ships empty by default — selecting Algolia without
    // configuring indices must fail fast rather than return an empty service.
    await expect(SEARCH_PROVIDERS.algolia(fakeLogger)).rejects.toThrow(
      /indices/i,
    );
  });
});
