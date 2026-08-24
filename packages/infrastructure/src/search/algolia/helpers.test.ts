import { describe, expect, it, vi } from "vitest";

import { type Logger } from "#root/logging/types";
import {
  CATEGORY_FILTER_KEY,
  COLLECTION_FILTER_KEY,
} from "#root/use-cases/search/consts";

import { buildFilters } from "./helpers";
import { type IndicesSettings } from "./types";

const CHANNEL = "channel-us";

const INDICES: IndicesSettings = [
  {
    channel: CHANNEL,
    indexName: "channel-us.USD.products",
    availableFacets: {
      "attributes.Color": { slug: "color", type: "SWATCH" },
      "attributes.Size": { slug: "size", type: "MULTISELECT" },
      "categories.lvl0": { slug: CATEGORY_FILTER_KEY, type: "DROPDOWN" },
      collections: { slug: COLLECTION_FILTER_KEY, type: "MULTISELECT" },
    },
    virtualReplicas: [],
  },
];

const logger = () =>
  ({
    error: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
  }) as unknown as Logger;

const build = (
  args: Omit<
    Parameters<typeof buildFilters>[0],
    "channel" | "indices" | "logger"
  >,
  log: Logger = logger(),
) => buildFilters({ ...args, channel: CHANNEL, indices: INDICES, logger: log });

describe("buildFilters", () => {
  it("returns an empty string when there is nothing to narrow by", () => {
    expect(build({})).toBe("");
    expect(build({ filters: {} })).toBe("");
  });

  it("filters a category on the attribute the index facets on, not on its filter slug", () => {
    expect(build({ filters: { [CATEGORY_FILTER_KEY]: "Shoes" } })).toBe(
      "'categories.lvl0':'Shoes'",
    );
  });

  it("keeps the facet value verbatim instead of deriving it from a slug", () => {
    expect(
      build({ filters: { [CATEGORY_FILTER_KEY]: "Jackets & coats" } }),
    ).toBe("'categories.lvl0':'Jackets & coats'");
  });

  it("drops filters the index does not facet on", () => {
    expect(build({ filters: { unknown: "value" } })).toBe("");
  });

  it("ignores a filter submitted with no value", () => {
    expect(build({ filters: { color: "" } })).toBe("");
  });

  it("joins comma-separated selections into a single OR clause", () => {
    expect(
      build({ filters: { [COLLECTION_FILTER_KEY]: "Party,Discover" } }),
    ).toBe("('collections':'Party' OR 'collections':'Discover')");
  });

  it("joins dot-separated group selections the same way", () => {
    expect(build({ filters: { color: "black.white" } })).toBe(
      "('attributes.Color':'black' OR 'attributes.Color':'white')",
    );
  });

  it("ANDs distinct filters together", () => {
    expect(build({ filters: { color: "black", size: "M,L" } })).toBe(
      "'attributes.Color':'black' AND ('attributes.Size':'M' OR 'attributes.Size':'L')",
    );
  });

  it("escapes a quote inside a facet value so the clause stays parseable", () => {
    expect(build({ filters: { [CATEGORY_FILTER_KEY]: "Men's" } })).toBe(
      "'categories.lvl0':'Men\\'s'",
    );
  });

  it("scopes by the browsed category using its name", () => {
    expect(
      build({
        categoryScope: { name: "Jackets & coats", slug: "jackets-coats" },
      }),
    ).toBe("'categories.lvl0':'Jackets & coats'");
  });

  it("lets the browsed category outrank the same filter from the URL", () => {
    expect(
      build({
        filters: { [CATEGORY_FILTER_KEY]: "Trousers", color: "black" },
        categoryScope: { name: "Shoes", slug: "shoes" },
      }),
    ).toBe("'attributes.Color':'black' AND 'categories.lvl0':'Shoes'");
  });

  it("reports a scope it cannot apply rather than silently widening to the whole catalog", () => {
    const log = logger();

    expect(
      buildFilters({
        channel: CHANNEL,
        indices: [{ ...INDICES[0], availableFacets: {} }],
        categoryScope: { name: "Shoes", slug: "shoes" },
        logger: log,
      }),
    ).toBe("");
    expect(log.error).toHaveBeenCalledOnce();
  });

  it("returns an empty string for a channel with no configured index", () => {
    expect(
      buildFilters({
        channel: "channel-unknown",
        indices: INDICES,
        filters: { color: "black" },
        logger: logger(),
      }),
    ).toBe("");
  });
});
