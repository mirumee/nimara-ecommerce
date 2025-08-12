import { PlusCircle } from "lucide-react";
import { getTranslations } from "next-intl/server";

import {
  type Product,
  type ProductAvailability,
} from "@nimara/domain/objects/Product";
import { Button } from "@nimara/ui/components/button";
import { Skeleton } from "@nimara/ui/components/skeleton";

import { CACHE_TTL } from "@/config";
import { getCheckoutId } from "@/lib/actions/cart";
import { VariantSelector } from "@/pdp/components/variant-selector";
import { getCurrentRegion } from "@/regions/server";
import { getCartService } from "@/services/cart";

type VariantPickerProps = {
  availability: ProductAvailability;
  product: Product;
};

/**
 * A server wrapper for the VariantSelector component.
 * It fetches the cart data and passes it along with the product and its availability to the VariantSelector.
 */
export const VariantSelectorWrapper = async ({
  availability,
  product,
}: VariantPickerProps) => {
  const [region, checkoutId, cartService] = await Promise.all([
    getCurrentRegion(),
    getCheckoutId(),
    getCartService(),
  ]);

  const resultCartGet = checkoutId
    ? await cartService.cartGet({
        cartId: checkoutId,
        languageCode: region.language.code,
        countryCode: region.market.countryCode,
        options: {
          next: {
            revalidate: CACHE_TTL.cart,
            tags: [`CHECKOUT:${checkoutId}`],
          },
        },
      })
    : null;

  return (
    <VariantSelector
      cart={resultCartGet?.ok ? resultCartGet.data : null}
      product={product}
      productAvailability={availability}
    />
  );
};

export const VariantSelectorSkeleton = async () => {
  const t = await getTranslations();

  return (
    <div>
      <Skeleton className="mb-4 h-8 w-1/4" />
      <Skeleton className="mb-4 h-8 w-full" />
      <Skeleton className="mb-4 h-8 w-full" />

      <div className="flex flex-wrap gap-2">
        <Skeleton className="mb-4 h-8 w-1/4" />
        <Skeleton className="mb-4 h-8 w-1/4" />
        <Skeleton className="mb-4 h-8 w-1/4" />
      </div>

      <Button className="my-4 w-full" disabled={true}>
        <PlusCircle className="mr-2 h-4" />
        {t("common.add-to-bag")}
      </Button>
    </div>
  );
};
