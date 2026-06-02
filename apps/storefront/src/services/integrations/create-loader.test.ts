import { describe, expect, it, vi } from "vitest";

import type { Logger } from "@nimara/infrastructure/logging/types";

import { createServiceLoader } from "./create-loader";
import type { ProviderRegistry } from "./types";

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
  it("instantiates the selected provider", async () => {
    const providers = {
      saleor: async () => ({ name: "saleor" }),
      algolia: async () => ({ name: "algolia" }),
    } satisfies ProviderRegistry<FakeService>;

    const load = createServiceLoader({
      providers,
      resolveProvider: () => "algolia",
      emptyService,
      logger: fakeLogger,
    });

    expect(await load()).toEqual({ name: "algolia" });
  });

  it("falls back to the empty service when no provider is resolved", async () => {
    const providers = {
      saleor: async () => ({ name: "saleor" }),
    } satisfies ProviderRegistry<FakeService>;

    const load = createServiceLoader({
      providers,
      resolveProvider: () => null,
      emptyService,
      logger: fakeLogger,
    });

    expect(await load()).toBe(emptyService);
  });

  it("warns and falls back when the provider id is unknown", async () => {
    const warning = vi.fn();
    const providers = {
      saleor: async () => ({ name: "saleor" }),
    } satisfies ProviderRegistry<FakeService>;

    const load = createServiceLoader({
      providers,
      // Simulate an env value with no matching registry entry.
      resolveProvider: () => "ghost",
      emptyService,
      logger: { ...fakeLogger, warning },
    });

    expect(await load()).toBe(emptyService);
    expect(warning).toHaveBeenCalledOnce();
  });

  it("instantiates the provider only once and caches it", async () => {
    const factory = vi.fn(async () => ({ name: "saleor" }));
    const providers = {
      saleor: factory,
    } satisfies ProviderRegistry<FakeService>;

    const load = createServiceLoader({
      providers,
      resolveProvider: () => "saleor",
      emptyService,
      logger: fakeLogger,
    });

    const first = await load();
    const second = await load();

    expect(first).toBe(second);
    expect(factory).toHaveBeenCalledOnce();
  });
});
