import { getAccessToken } from "@/auth";
import { clientEnvs } from "@/envs/client";
import { paths } from "@/foundation/routing/paths";
import { getServiceRegistry } from "@/services/registry";
import { StandardHomeView } from "@nimara/features/home-page/shop-basic-home/standard";
import { generateStandardHomeMetadata } from "@nimara/features/home-page/shared/metadata/standard-metadata";

export async function generateMetadata(props: any) {
  const storefrontUrl = clientEnvs.NEXT_PUBLIC_STOREFRONT_URL;

  return generateStandardHomeMetadata({
    ...props,
    storefrontUrl,
  });
}

export default async function Page(props: any) {
  const services = await getServiceRegistry();
  const accessToken = await getAccessToken();

  return (
    <StandardHomeView
      {...props}
      services={services}
      accessToken={accessToken}
      paths={{
        search: paths.search.asPath(),
        product: (slug) => paths.products.asPath({ slug }),
      }}
    />
  );
}
