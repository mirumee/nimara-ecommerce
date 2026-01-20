// const StandardPDPView = dynamic(() =>
//   import("@/pdp/views/standard").then((mod) => mod.StandardPDPView),
// );
// const CustomPDPView = dynamic(() =>
//   import("@/pdp/views/custom").then((mod) => mod.CustomPDPView),
// );
import type { Metadata } from "next";

import { generateStandardPDPMetadata } from "@nimara/features/product-detail-page/shared/metadata/standard-metadata";
import { StandardPDPView } from "@nimara/features/product-detail-page/shop-basic-pdp/standard";

import { addToBagAction } from "@/app/[locale]/(main)/products/[slug]/_actions/add-to-bag";
import { clientEnvs } from "@/envs/client";
import { getCheckoutId } from "@/features/checkout/cart";
import { paths } from "@/foundation/routing/paths";
import { getServiceRegistry } from "@/services/registry";

type ProductPageProps = {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
};

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const services = await getServiceRegistry();
  const { slug } = await params;
  const storefrontUrl = clientEnvs.NEXT_PUBLIC_STOREFRONT_URL;
  const productPath = paths.products.asPath({ slug });

  return generateStandardPDPMetadata({
    params,
    services,
    storefrontUrl,
    productPath,
  });
}

export default async function ProductPage(props: ProductPageProps) {
  // Initialize service registry
  const services = await getServiceRegistry();
  const checkoutId = await getCheckoutId();

  // This is just a temporary solution to determine the layout.
  // const pdpLayout = (await cookies()).get("PDP_LAYOUT")?.value;

  // if (pdpLayout === "CUSTOM") {
  //   return <CustomPDPView {...props} services={services} />;
  // }

  // Fallback to standard layout
  return (
    <StandardPDPView
      {...props}
      services={services}
      checkoutId={checkoutId}
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
