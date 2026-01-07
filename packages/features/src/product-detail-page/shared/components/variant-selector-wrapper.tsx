import { PlusCircle } from "lucide-react";
import { getTranslations } from "next-intl/server";

import {
  type Product,
  type ProductAvailability,
} from "@nimara/domain/objects/Product";
import { Button } from "@nimara/ui/components/button";
import { Skeleton } from "@nimara/ui/components/skeleton";

import { VariantSelector } from "@nimara/features/product-detail-page/shared/components/variant-selector";
import { ServiceRegistry } from "@nimara/infrastructure/types";
import { type AddToBagAction } from "../types";

type VariantPickerProps = {
  availability: ProductAvailability;
  product: Product;
  services: ServiceRegistry;
  cartPath: string;
  checkoutId: string | null;
  addToBagAction: AddToBagAction;
};

/**
 * A server wrapper for the VariantSelector component.
 * It fetches the cart data and passes it along with the product and its availability to the VariantSelector.
 */
export const VariantSelectorWrapper = async ({
  availability,
  product,
  services,
  cartPath,
  checkoutId,
  addToBagAction,
}: VariantPickerProps) => {

  const resultCartGet = checkoutId
    ? await services.cart.cartGet({
      cartId: checkoutId,
      languageCode: services.region.language.code,
      countryCode: services.region.market.countryCode,
      options: {
        next: {
          revalidate: services.config.cacheTTL.cart,
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
      cartPath={cartPath}
      addToBagAction={addToBagAction}
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
