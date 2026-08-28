import { beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";

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

/** A real `ZodError`, the way a provider config mapper produces one. */
const configError = (() => {
  const result = z.object({ SEARCH_ALGOLIA_APP_ID: z.string() }).safeParse({});

  return result.success
    ? new Error("the schema must reject an empty env")
    : result.error;
})();

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
    const load = createServiceLoader<FakeService, string>({
      capability: "search",
      resolve: () => "algolia",
      build: async () => {
        throw configError;
      },
      emptyService,
      logger: fakeLogger,
    });

    expect(await load()).toBe(emptyService);
    expect(fakeLogger.critical).toHaveBeenCalledWith(expect.any(String), {
      capability: "search",
      provider: "algolia",
      reason: expect.stringContaining("SEARCH_ALGOLIA_APP_ID"),
    });
  });

  it("does not retry an invalid config on the next call", async () => {
    const build = vi.fn(async () => {
      throw configError;
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

  it("rebuilds after a transient construction failure", async () => {
    const build = vi
      .fn(async (provider: string) => ({ name: provider }))
      .mockRejectedValueOnce(new Error("socket hang up"));

    const load = createServiceLoader<FakeService, string>({
      capability: "search",
      resolve: () => "algolia",
      build,
      emptyService,
      logger: fakeLogger,
    });

    expect(await load()).toBe(emptyService);
    expect(await load()).toEqual({ name: "algolia" });
    expect(build).toHaveBeenCalledTimes(2);
    expect(fakeLogger.error).toHaveBeenCalledOnce();
    expect(fakeLogger.critical).not.toHaveBeenCalled();
  });

  it("keeps the rebuilt service once a transient failure clears", async () => {
    const build = vi
      .fn(async (provider: string) => ({ name: provider }))
      .mockRejectedValueOnce(new Error("socket hang up"));

    const load = createServiceLoader<FakeService, string>({
      capability: "search",
      resolve: () => "algolia",
      build,
      emptyService,
      logger: fakeLogger,
    });

    await load();
    const first = await load();
    const second = await load();

    expect(first).toBe(second);
    expect(build).toHaveBeenCalledTimes(2);
  });

  it("builds the service once for calls that overlap the first build", async () => {
    let release: (() => void) | undefined;
    const started = new Promise<void>((resolve) => {
      release = resolve;
    });

    const build = vi.fn(async (provider: string) => {
      await started;

      return { name: provider };
    });

    const load = createServiceLoader({
      capability: "search",
      resolve: () => "algolia",
      build,
      emptyService,
      logger: fakeLogger,
    });

    const first = load();
    const second = load();

    release?.();

    expect(await first).toBe(await second);
    expect(build).toHaveBeenCalledOnce();
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
