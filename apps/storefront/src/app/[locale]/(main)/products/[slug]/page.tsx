import type { Metadata } from "next";
import { type Locale } from "next-intl";

import { generateStandardPDPMetadata } from "@nimara/features/product-detail-page/shared/metadata/standard-metadata";
import { type PDPViewProps } from "@nimara/features/product-detail-page/shared/types";
import { StandardPDPView } from "@nimara/features/product-detail-page/shop-basic-pdp/standard";
import { MarketplacePDPView } from "@nimara/features/product-detail-page/shop-marketplace-pdp/marketplace";

import { clientEnvs } from "@/envs/client";
import { getCheckoutId } from "@/features/checkout/server";
import { getCurrentRegion } from "@/foundation/regions";
import { paths } from "@/foundation/routing/paths";
import { getServiceRegistry } from "@/services/registry";

import { addToBagAction } from "./_actions/add-to-bag";

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
  const [checkoutId, services, region] = await Promise.all([
    getCheckoutId(),
    getServiceRegistry(),
    getCurrentRegion(),
  ]);

  const standardProps = {
    ...props,
    services,
    checkoutId,
    region,
    paths: {
      home: paths.home.asPath(),
      cart: paths.cart.asPath(),
      search: (query) => paths.search.asPath({ query }),
      product: (slug) => paths.products.asPath({ slug }),
    },
    addToBagAction,
  } satisfies PDPViewProps;

  if (clientEnvs.NEXT_PUBLIC_MARKETPLACE_ENABLED) {
    return (
      <MarketplacePDPView
        {...standardProps}
        paths={{
          ...standardProps.paths,
          vendor: (vendorSlug) => paths.vendor.asPath({ vendorSlug }),
        }}
      />
    );
  }

  return <StandardPDPView {...standardProps} />;
}
