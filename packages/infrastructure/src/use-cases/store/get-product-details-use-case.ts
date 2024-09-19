import type { FetchOptions } from "#root/graphql/client";
import type {
  GetProductAvailabilityDetailsInfra,
  GetProductDetailsInfra,
  GetProductDetailsUseCase,
} from "#root/public/saleor/store/types";

export const getProductDetailsUseCase =
  ({
    getProductDetailsInfra,
    getProductAvailabilityDetailsInfra,
  }: {
    getProductAvailabilityDetailsInfra: GetProductAvailabilityDetailsInfra;
    getProductDetailsInfra: GetProductDetailsInfra;
  }): GetProductDetailsUseCase =>
  async ({ productSlug, customMediaFormat, options }) => {
    const [availabilityData, productData] = await Promise.all([
      getProductAvailabilityDetailsInfra({
        productSlug,
        customMediaFormat,
        options: JSON.parse(
          JSON.stringify({ ...options, cache: "no-store" }),
        ) as FetchOptions,
      }),
      getProductDetailsInfra({
        productSlug,
        customMediaFormat,
        options,
      }),
    ]);

    if (!availabilityData.availability || !productData.product) {
      const errors = [
        ...(availabilityData.errors ?? []),
        ...(productData?.errors ?? []),
      ];

      return { errors, data: null };
    }

    return {
      data: {
        product: productData.product,
        availability: availabilityData.availability,
      },
      errors: [],
    };
  };
