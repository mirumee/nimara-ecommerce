import type { Metadata } from "next";
import { type Locale } from "next-intl";

import { generateStandardPDPMetadata } from "@nimara/features/product-detail-page/shared/metadata/standard-metadata";
import { StandardPDPView } from "@nimara/features/product-detail-page/shop-basic-pdp/standard";

import { addToBagAction } from "@/app/[locale]/(main)/products/[slug]/_actions/add-to-bag";
import { clientEnvs } from "@/envs/client";
import { getCheckoutId } from "@/features/checkout/cart";
import { getCurrentRegion } from "@/foundation/regions";
import { paths } from "@/foundation/routing/paths";
import { getServiceRegistry } from "@/services/registry";

type ProductPageProps = {
  params: Promise<{ locale: Locale; slug: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
};

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const [{ slug }, services, region] = await Promise.all([
    params,
    getServiceRegistry(),
    getCurrentRegion(),
  ]);
  const storefrontUrl = clientEnvs.NEXT_PUBLIC_STOREFRONT_URL;
  const productPath = paths.products.asPath({ slug });

  return generateStandardPDPMetadata({
    params,
    services,
    storefrontUrl,
    productPath,
    region,
  });
}

export default async function ProductPage(props: ProductPageProps) {
  const services = await getServiceRegistry();
  const [checkoutId, region] = await Promise.all([
    getCheckoutId(),
    getCurrentRegion(),
  ]);

  return (
    <StandardPDPView
      {...props}
      services={services}
      checkoutId={checkoutId}
      region={region}
      paths={{
        home: paths.home.asPath(),
        cart: paths.cart.asPath(),
        search: (query) => paths.search.asPath({ query }),
        product: (slug) => paths.products.asPath({ slug }),
      }}
      addToBagAction={addToBagAction}
    />
  );
}
