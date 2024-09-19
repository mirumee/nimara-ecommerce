import type { DeepNonNullable, DeepRequired } from "ts-essentials";

import type { ProductAvailability } from "@nimara/domain/objects/Product";

import { type FetchOptions, graphqlClient } from "#root/graphql/client";

import type { ProductAvailabilityDetailsFragment } from "../graphql/fragments/generated";
import { ProductAvailabilityDetailsQueryDocument } from "../graphql/queries/generated";
import type {
  GetProductAvailabilityDetailsInfra,
  SaleorStoreServiceConfig,
} from "../types";

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
  }: SaleorStoreServiceConfig): GetProductAvailabilityDetailsInfra =>
  async ({ productSlug, options }) => {
    const { cache: _, ...fetchOptions }: FetchOptions = { ...options };

    // Infra is does not know anything about next.js specific overloads.
    delete (fetchOptions as any)?.next?.revalidate;

    const { data, error } = await graphqlClient(apiURI).execute(
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
      },
    );

    if (error) {
      return { errors: [error], availability: null };
    }

    return {
      availability: data?.product ? parseData(data.product) : null,
      errors: [],
    };
  };
