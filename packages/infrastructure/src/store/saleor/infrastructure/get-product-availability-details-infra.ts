import type { DeepNonNullable, DeepRequired } from "ts-essentials";

import type { ProductAvailability } from "@nimara/domain/objects/Product";
import { ok } from "@nimara/domain/objects/Result";

import { type FetchOptions, graphqlClient } from "#root/graphql/client";

import type {
  GetProductAvailabilityDetailsInfra,
  SaleorProductServiceConfig,
} from "../../types";
import type { ProductAvailabilityDetailsFragment } from "../graphql/fragments/generated";
import { ProductAvailabilityDetailsQueryDocument } from "../graphql/queries/generated";

const parseData = (
  data: ProductAvailabilityDetailsFragment,
): ProductAvailability => {
  const { pricing, isAvailable, variantsAvailability } = data as DeepRequired<
    DeepNonNullable<ProductAvailabilityDetailsFragment>
  >;
  const taxType = pricing.displayGrossPrices ? "gross" : "net";

  return {
    isAvailable,
    startPrice: {
      type: taxType,
      ...(pricing.priceRange?.start[taxType] ?? 0),
    },
    variants:
      variantsAvailability.map(
        ({ quantityAvailable, id, pricing, quantityLimitPerCustomer }) => ({
          quantityAvailable: quantityAvailable ?? 0,
          id,
          quantityLimitPerCustomer,
          price: {
            amount: pricing.price[taxType].amount,
            currency: pricing.price[taxType].currency,
            type: taxType,
          },
          priceUndiscounted: {
            type: taxType,
            amount: pricing.priceUndiscounted[taxType].amount,
            currency: pricing.priceUndiscounted[taxType].currency,
          },
        }),
      ) ?? [],
  };
};

export const getProductAvailabilityDetailsInfra =
  ({
    apiURI,
    channel,
    countryCode,
    logger,
  }: SaleorProductServiceConfig): GetProductAvailabilityDetailsInfra =>
  async ({ productSlug, options }) => {
    const { cache: _, ...fetchOptions }: FetchOptions = { ...options };

    // Infra is does not know anything about next.js specific overloads.
    delete (fetchOptions as any)?.next?.revalidate;

    const result = await graphqlClient(apiURI).execute(
      ProductAvailabilityDetailsQueryDocument,
      {
        options: {
          ...fetchOptions,
          // Availability should be never cached!
          cache: "no-store",
        },
        variables: {
          slug: productSlug,
          channel,
          countryCode,
        },
        operationName: "ProductAvailabilityDetailsQuery",
      },
    );

    if (!result.ok) {
      logger.error("Error while fetching product availability", {
        productSlug,
        channel,
        countryCode,
        result,
      });

      return result;
    }
    if (!result.data.product) {
      return ok({ availability: null });
    }

    return ok({
      availability: parseData(result.data.product),
    });
  };
