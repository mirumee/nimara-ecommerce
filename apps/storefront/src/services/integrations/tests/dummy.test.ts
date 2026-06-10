import { describe, expect, it, vi } from "vitest";

import { dummyCMSMenuService } from "@nimara/infrastructure/cms-menu/providers";
import { dummyCMSPageService } from "@nimara/infrastructure/cms-page/providers";
import type { Logger } from "@nimara/infrastructure/logging/types";
import { dummySearchService } from "@nimara/infrastructure/search/dummy/provider";

const logger = {
  debug: vi.fn(),
  info: vi.fn(),
  warning: vi.fn(),
  error: vi.fn(),
  critical: vi.fn(),
} satisfies Logger;

const ctx = { channel: "default-channel" };

describe("dummy search provider", () => {
  const service = dummySearchService({ logger });

  it("returns all sample products when nothing filters them", async () => {
    const result = await service.search({ limit: 100 }, ctx);

    if (!result.ok) {
      throw new Error("expected ok result");
    }
    expect(result.data.results.length).toBeGreaterThan(0);
  });

  it("filters by query substring on the product name", async () => {
    const result = await service.search({ limit: 100, query: "hoodie" }, ctx);

    if (!result.ok) {
      throw new Error("expected ok result");
    }
    expect(result.data.results).toHaveLength(1);
    expect(result.data.results[0].name.toLowerCase()).toContain("hoodie");
  });

  it("paginates with numeric page info", async () => {
    const result = await service.search({ limit: 3, page: "1" }, ctx);

    if (!result.ok) {
      throw new Error("expected ok result");
    }
    expect(result.data.results).toHaveLength(3);
    expect(result.data.pageInfo).toMatchObject({
      type: "numeric",
      currentPage: 1,
      hasNextPage: true,
      hasPreviousPage: false,
    });
  });

  it("exposes facets and sort options", async () => {
    const facets = await service.getFacets({}, ctx);
    const sort = service.getSortByOptions(ctx);

    expect(facets.ok && facets.data.length).toBeGreaterThan(0);
    expect(sort.ok && sort.data.length).toBeGreaterThan(0);
  });
});

describe("dummy CMS page provider", () => {
  const service = dummyCMSPageService({ logger });

  it("returns the homepage with the fields the home view reads", async () => {
    const result = await service.cmsPageGet({
      slug: "home",
      languageCode: "en",
    });

    if (!result.ok || !result.data) {
      throw new Error("expected a home page");
    }
    const slugs = result.data.fields.map((field) => field.slug);

    expect(slugs).toContain("homepage-banner-header");
    expect(slugs).toContain("carousel-products");
  });

  it("returns null for an unknown slug", async () => {
    const result = await service.cmsPageGet({
      slug: "does-not-exist",
      languageCode: "en",
    });

    expect(result.ok && result.data).toBeNull();
  });
});

describe("dummy CMS menu provider", () => {
  const service = dummyCMSMenuService({ logger });
  const callMenu = (slug?: "navbar" | "footer") =>
    service.menuGet({
      channel: "default-channel",
      languageCode: "EN_US",
      slug,
    } as unknown as Parameters<typeof service.menuGet>[0]);

  it("returns a menu for navbar and footer", async () => {
    const navbar = await callMenu("navbar");
    const footer = await callMenu("footer");

    expect(navbar.ok && navbar.data?.menu.items.length).toBeGreaterThan(0);
    expect(footer.ok && footer.data?.menu.items.length).toBeGreaterThan(0);
  });

  it("returns null when no slug is provided", async () => {
    const result = await callMenu(undefined);

    expect(result.ok && result.data).toBeNull();
  });
});
