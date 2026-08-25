import { describe, expect, it } from "vitest";

import {
  CATEGORY_FILTER_KEY,
  COLLECTION_FILTER_KEY,
} from "#root/use-cases/search/consts";

import {
  buildCategoryFacet,
  buildCollectionFacet,
  buildFacetsWhere,
} from "./helpers";

const STOREFRONT_ATTRIBUTES = {
  visibleInStorefront: true,
  type: { eq: "PRODUCT_TYPE" },
  withChoices: true,
};

describe("helpers", () => {
  describe("buildFacetsWhere", () => {
    it("returns the unscoped storefront predicate when no taxonomy is given", () => {
      expect(buildFacetsWhere({})).toEqual(STOREFRONT_ATTRIBUTES);
    });

    it("ignores empty and nullish taxonomy lists", () => {
      expect(
        buildFacetsWhere({ categoryIds: [], collectionIds: null }),
      ).toEqual(STOREFRONT_ATTRIBUTES);
    });

    it("scopes to a single category without an OR wrapper", () => {
      expect(buildFacetsWhere({ categoryIds: ["cat-1"] })).toEqual({
        AND: [STOREFRONT_ATTRIBUTES, { inCategory: "cat-1" }],
      });
    });

    it("scopes to a single collection without an OR wrapper", () => {
      expect(buildFacetsWhere({ collectionIds: ["col-1"] })).toEqual({
        AND: [STOREFRONT_ATTRIBUTES, { inCollection: "col-1" }],
      });
    });

    it("joins multiple categories with OR so a facet from any of them survives", () => {
      expect(buildFacetsWhere({ categoryIds: ["cat-1", "cat-2"] })).toEqual({
        AND: [
          STOREFRONT_ATTRIBUTES,
          { OR: [{ inCategory: "cat-1" }, { inCategory: "cat-2" }] },
        ],
      });
    });

    it("joins multiple collections with OR", () => {
      expect(buildFacetsWhere({ collectionIds: ["col-1", "col-2"] })).toEqual({
        AND: [
          STOREFRONT_ATTRIBUTES,
          { OR: [{ inCollection: "col-1" }, { inCollection: "col-2" }] },
        ],
      });
    });

    it("requires both scopes when a category and a collection are browsed together", () => {
      expect(
        buildFacetsWhere({
          categoryIds: ["cat-1", "cat-2"],
          collectionIds: ["col-1"],
        }),
      ).toEqual({
        AND: [
          STOREFRONT_ATTRIBUTES,
          { OR: [{ inCategory: "cat-1" }, { inCategory: "cat-2" }] },
          { inCollection: "col-1" },
        ],
      });
    });
  });

  describe("buildCategoryFacet", () => {
    it("returns no facet for an empty taxonomy so the panel stays hidden", () => {
      expect(buildCategoryFacet([])).toEqual([]);
    });

    it("maps entries onto the reserved category slug", () => {
      expect(
        buildCategoryFacet([
          { name: "Accessories", slug: "accessories" },
          { name: "Apparel", slug: "apparel" },
        ]),
      ).toEqual([
        {
          slug: CATEGORY_FILTER_KEY,
          messageKey: "filters.category",
          type: "MULTISELECT",
          choices: [
            { label: "Accessories", value: "accessories" },
            { label: "Apparel", value: "apparel" },
          ],
        },
      ]);
    });
  });

  describe("buildCollectionFacet", () => {
    it("returns no facet for an empty taxonomy so the panel stays hidden", () => {
      expect(buildCollectionFacet([])).toEqual([]);
    });

    it("maps entries onto the reserved collection slug", () => {
      expect(
        buildCollectionFacet([{ name: "Summer sale", slug: "summer-sale" }]),
      ).toEqual([
        {
          slug: COLLECTION_FILTER_KEY,
          messageKey: "filters.collections",
          type: "MULTISELECT",
          choices: [{ label: "Summer sale", value: "summer-sale" }],
        },
      ]);
    });
  });
});
