import { err, ok } from "@nimara/domain/objects/Result";

import { graphqlClient } from "#root/graphql/client";
import type { Logger } from "#root/logging/types";

import type { MarketplaceService } from "../types";
import {
  VendorGetByIdDocument,
  VendorGetBySlugDocument,
} from "./graphql/queries/generated";
import { vendorPageToProfile } from "./serializers";

export interface SaleorMarketplaceServiceConfig {
  apiURL: string;
  cacheTTL: {
    vendorProfile: number;
  };
  logger: Logger;
}

export const saleorMarketplaceService = (
  config: SaleorMarketplaceServiceConfig,
): MarketplaceService => {
  return {
    vendorGetByID: async (id: string) => {
      const result = await graphqlClient(config.apiURL).execute(
        VendorGetByIdDocument,
        {
          operationName: "VendorGetByIdQuery",
          variables: { id },
          options: {
            next: {
              revalidate: config.cacheTTL.vendorProfile,
              tags: [`MARKETPLACE:VENDOR:${id}`],
            },
          },
        },
      );

      if (!result.ok) {
        config.logger.error("Failed to get vendor by ID", {
          id,
          errors: result.errors,
        });

        return result;
      }

      if (!result.data.page) {
        return err([{ code: "NOT_FOUND_ERROR", message: "Vendor not found" }]);
      }

      return ok(vendorPageToProfile(result.data.page));
    },
    vendorGetBySlug: async (slug: string) => {
      const result = await graphqlClient(config.apiURL).execute(
        VendorGetBySlugDocument,
        {
          operationName: "VendorGetBySlugQuery",
          variables: { slug },
          options: {
            next: {
              revalidate: config.cacheTTL.vendorProfile,
              tags: [`MARKETPLACE:VENDOR:${slug}`],
            },
          },
        },
      );

      if (!result.ok) {
        config.logger.error("Failed to get vendor by slug", {
          slug,
          errors: result.errors,
        });

        return result;
      }

      if (!result.data.page) {
        return err([{ code: "NOT_FOUND_ERROR", message: "Vendor not found" }]);
      }

      return ok(vendorPageToProfile(result.data.page));
    },
  };
};
