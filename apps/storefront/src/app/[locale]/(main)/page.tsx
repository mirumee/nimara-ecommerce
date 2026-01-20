import { generateStandardHomeMetadata } from "@nimara/features/home-page/shared/metadata/standard-metadata";
import { type HomeViewProps } from "@nimara/features/home-page/shared/types";
import { StandardHomeView } from "@nimara/features/home-page/shop-basic-home/standard";

import { clientEnvs } from "@/envs/client";
import { paths } from "@/foundation/routing/paths";
import { getServiceRegistry } from "@/services/registry";
import { getAccessToken } from "@/services/tokens";

export async function generateMetadata() {
  const storefrontUrl = clientEnvs.NEXT_PUBLIC_STOREFRONT_URL;

  return generateStandardHomeMetadata({ storefrontUrl });
}

export default async function Page(props: HomeViewProps) {
  const services = await getServiceRegistry();
  const accessToken = await getAccessToken();

  return (
    <StandardHomeView
      {...props}
      services={services}
      accessToken={accessToken || null}
      paths={{
        search: paths.search.asPath(),
        product: (slug) => paths.products.asPath({ slug }),
      }}
    />
  );
}
