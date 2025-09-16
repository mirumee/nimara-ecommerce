import { useMemo } from "react";

import { type Image } from "@nimara/domain/objects/common";
import { type Product } from "@nimara/domain/objects/Product";

/**
 * Returns the images for the currently selected product variant.
 * If no variant is selected, it returns the default media images.
 * @param variants The product variants.
 * @param media The media images for the product.
 * @param params The URL search parameters.
 * @returns The images for the selected variant or the default media images.
 */
export const useSelectedVariantImages = (
  variants: Product["variants"],
  media: Image[],
  params: URLSearchParams,
) => {
  return useMemo(() => {
    const parsedParams = Object.fromEntries(params.entries());
    const selectedVariant = variants.find((variant) =>
      variant.selectionAttributes.every((attr) => {
        const value = parsedParams[attr.slug];

        return value && value === attr.values[0].slug;
      }),
    );

    return selectedVariant?.images?.length ? selectedVariant.images : media;
  }, [params.toString(), media, variants]);
};
