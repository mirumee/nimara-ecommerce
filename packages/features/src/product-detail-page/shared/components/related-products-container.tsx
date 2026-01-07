import type { ServiceRegistry } from "@nimara/infrastructure/types";
import { RelatedProducts } from "./related-products";

type Props = {
  slug: string;
  services: ServiceRegistry;
  productPath: (slug: string) => string;
};

export const RelatedProductsContainer = async ({ slug, services, productPath }: Props) => {
  const region = services.region;

  const result = await services.store.getProductRelatedProducts({
    productSlug: slug,
    channel: region.market.channel,
    languageCode: region.language.code,
    countryCode: region.market.countryCode,
    options: {
      next: {
        tags: [`PRODUCT:${slug}`, "DETAIL-PAGE:PRODUCT"],
        revalidate: services.config.cacheTTL.pdp,
      },
    },
  });

  if (!result?.data?.products?.length) {
    return null;
  }

  // Compute paths on the server side to avoid passing functions to Client Components
  const productPaths = result.data.products
    .reduce((acc, product) => {
      return { ...acc, [product.slug]: productPath(product.slug) };
    }, {} as Record<string, string>);


  return <RelatedProducts products={result.data.products} productPaths={productPaths} />;
};
