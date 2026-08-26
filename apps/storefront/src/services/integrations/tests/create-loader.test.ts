import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Logger } from "@nimara/infrastructure/logging/types";

import { createServiceLoader } from "../../utils/create-loader";

type FakeService = { name: string };

const fakeLogger = {
  debug: vi.fn(),
  info: vi.fn(),
  warning: vi.fn(),
  error: vi.fn(),
  critical: vi.fn(),
} satisfies Logger;

const emptyService: FakeService = { name: "empty" };

describe("createServiceLoader", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("builds the service for the resolved provider", async () => {
    const load = createServiceLoader({
      capability: "search",
      resolve: () => "algolia",
      build: async (provider) => ({ name: provider }),
      emptyService,
      logger: fakeLogger,
    });

    expect(await load()).toEqual({ name: "algolia" });
  });

  it("falls back to the empty service when no provider is resolved", async () => {
    const build = vi.fn(async (provider: string) => ({ name: provider }));

    const load = createServiceLoader({
      capability: "search",
      resolve: () => null,
      build,
      emptyService,
      logger: fakeLogger,
    });

    expect(await load()).toBe(emptyService);
    expect(build).not.toHaveBeenCalled();
  });

  it("falls back to the empty service when the provider config is invalid", async () => {
    const load = createServiceLoader({
      capability: "search",
      resolve: () => "algolia",
      build: async () => {
        throw new Error("SEARCH_ALGOLIA_APP_ID is required");
      },
      emptyService,
      logger: fakeLogger,
    });

    expect(await load()).toBe(emptyService);
    expect(fakeLogger.critical).toHaveBeenCalledWith(expect.any(String), {
      capability: "search",
      provider: "algolia",
      reason: "SEARCH_ALGOLIA_APP_ID is required",
    });
  });

  it("does not retry a failed construction on the next call", async () => {
    const build = vi.fn(async () => {
      throw new Error("boom");
    });

    const load = createServiceLoader<FakeService, string>({
      capability: "search",
      resolve: () => "algolia",
      build,
      emptyService,
      logger: fakeLogger,
    });

    expect(await load()).toBe(emptyService);
    expect(await load()).toBe(emptyService);
    expect(build).toHaveBeenCalledOnce();
    expect(fakeLogger.critical).toHaveBeenCalledOnce();
  });

  it("builds the service only once and caches it", async () => {
    const build = vi.fn(async (provider: string) => ({ name: provider }));

    const load = createServiceLoader({
      capability: "search",
      resolve: () => "saleor",
      build,
      emptyService,
      logger: fakeLogger,
    });

    const first = await load();
    const second = await load();

    expect(first).toBe(second);
    expect(build).toHaveBeenCalledOnce();
  });
});
