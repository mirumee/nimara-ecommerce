import { ok } from "@nimara/domain/objects/Result";

import type { SearchInfra } from "#root/use-cases/search/types";

import { SAMPLE_PRODUCTS } from "../fixtures/sample-data";
import type { DummySearchServiceConfig } from "../types";

export const dummySearchInfra =
  (_config: DummySearchServiceConfig): SearchInfra =>
  async ({ query, productIds, limit, page }) => {
    let products = SAMPLE_PRODUCTS;

    if (productIds?.length) {
      const ids = new Set(productIds);

      products = products.filter((product) => ids.has(product.id));
    } else if (query) {
      const needle = query.toLowerCase();

      products = products.filter((product) =>
        product.name.toLowerCase().includes(needle),
      );
    }

    const currentPage = page ? Math.max(1, parseInt(page, 10) || 1) : 1;
    const start = (currentPage - 1) * limit;
    const results = products.slice(start, start + limit);

    return ok({
      pageInfo: {
        type: "numeric",
        currentPage,
        hasNextPage: start + limit < products.length,
        hasPreviousPage: currentPage > 1,
      },
      results,
    });
  };
