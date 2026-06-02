import { describe, expect, it, vi } from "vitest";

import type { Logger } from "@nimara/infrastructure/logging/types";

import { createServiceLoader } from "../create-loader";

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
  it("builds the service for the resolved provider", async () => {
    const load = createServiceLoader({
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
      resolve: () => null,
      build,
      emptyService,
      logger: fakeLogger,
    });

    expect(await load()).toBe(emptyService);
    expect(build).not.toHaveBeenCalled();
  });

  it("builds the service only once and caches it", async () => {
    const build = vi.fn(async (provider: string) => ({ name: provider }));

    const load = createServiceLoader({
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
