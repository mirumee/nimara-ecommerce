import { notFound } from "next/navigation";

import {
  type Product,
  type ProductAvailability,
} from "@nimara/domain/objects/Product";

import { CACHE_TTL } from "@/config";
import { JsonLd, productToJsonLd } from "@/lib/json-ld";
import { getCurrentRegion } from "@/regions/server";
import { getStoreService } from "@/services/store";

export const ProductProvider = async ({
  render,
  slug,
}: {
  render: (data: Product, availability: ProductAvailability) => React.ReactNode;
  slug: string;
}) => {
  const [region, storeService] = await Promise.all([
    getCurrentRegion(),
    getStoreService(),
  ]);

  const { data } = await storeService.getProductDetails({
    productSlug: slug,
    countryCode: region.market.countryCode,
    channel: region.market.channel,
    languageCode: region.language.code,
    options: {
      next: {
        revalidate: CACHE_TTL.pdp,
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
