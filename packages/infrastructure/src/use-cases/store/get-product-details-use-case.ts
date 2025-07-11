import { err, ok } from "@nimara/domain/objects/Result";

import type { FetchOptions } from "#root/graphql/client";
import type {
  GetProductAvailabilityDetailsInfra,
  GetProductDetailsInfra,
  GetProductDetailsUseCase,
} from "#root/store/types";

export const getProductDetailsUseCase =
  ({
    getProductDetailsInfra,
    getProductAvailabilityDetailsInfra,
  }: {
    getProductAvailabilityDetailsInfra: GetProductAvailabilityDetailsInfra;
    getProductDetailsInfra: GetProductDetailsInfra;
  }): GetProductDetailsUseCase =>
  async ({ languageCode, options, ...commonOpts }) => {
    const [resultGetProductAvailability, resultGetProductDetails] =
      await Promise.all([
        getProductAvailabilityDetailsInfra({
          ...commonOpts,
          options: JSON.parse(
            JSON.stringify({ ...options, cache: "no-store" }),
          ) as FetchOptions,
        }),
        getProductDetailsInfra({
          ...commonOpts,
          languageCode,
          options,
        }),
      ]);

    if (
      !resultGetProductAvailability.data?.availability ||
      !resultGetProductDetails.data?.product
    ) {
      return err([{ code: "NOT_AVAILABLE_ERROR" }]);
    }

    return ok({
      product: resultGetProductDetails.data.product,
      availability: resultGetProductAvailability.data.availability,
    });
  };
