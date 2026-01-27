import { notFound } from "next/navigation";

import {
  type Product,
  type ProductAvailability,
} from "@nimara/domain/objects/Product";
import { JsonLd, productToJsonLd } from "@nimara/features/json-ld/json-ld";
import type { ServiceRegistry } from "@nimara/infrastructure/types";

export interface ProductProviderProps {
  render: (data: Product, availability: ProductAvailability) => React.ReactNode;
  services: ServiceRegistry;
  slug: string;
}

export const ProductProvider = async ({
  render,
  slug,
  services,
}: ProductProviderProps) => {
  const region = services.region;

  const storeService = await services.getStoreService();
  const { data } = await storeService.getProductDetails({
    productSlug: slug,
    countryCode: region.market.countryCode,
    channel: region.market.channel,
    languageCode: region.language.code,
    options: {
      next: {
        revalidate: services.config.cacheTTL.pdp,
        tags: [`PRODUCT:${slug}`, "DETAIL-PAGE:PRODUCT"],
      },
    },
  });

  if (!data?.product) {
    return notFound();
  }

  return (
    <>
      {render(data.product, data.availability)}
      <JsonLd jsonLd={productToJsonLd(data.product, data?.availability)} />
    </>
  );
};
