import { generateStandardCollectionMetadata } from "@nimara/features/collection/shared/metadata/standard-metadata";
import { type CollectionViewProps } from "@nimara/features/collection/shared/types";
import { StandardCollectionView } from "@nimara/features/collection/shop-basic-collection/standard";

import { DEFAULT_RESULTS_PER_PAGE } from "@/config";
import { clientEnvs } from "@/envs/client";
import { DEFAULT_LOCALE } from "@/foundation/regions/config";
import { paths } from "@/foundation/routing/paths";
import { localePrefixes } from "@/i18n/routing";
import { getServiceRegistry } from "@/services/registry";

export async function generateMetadata(props: CollectionViewProps) {
  const services = await getServiceRegistry();
  const { slug } = await props.params;
  const storefrontUrl = clientEnvs.NEXT_PUBLIC_STOREFRONT_URL;
  const collectionPath = paths.collections.asPath({ slug });

  return generateStandardCollectionMetadata({
    ...props,
    services,
    storefrontUrl,
    collectionPath,
    defaultResultsPerPage: DEFAULT_RESULTS_PER_PAGE,
  });
}

export default async function Page(props: CollectionViewProps) {
  const services = await getServiceRegistry();
  // const { slug } = await props.params;

  return (
    <StandardCollectionView
      {...props}
      services={services}
      paths={{
        home: paths.home.asPath(),
        collection: (slug) => paths.collections.asPath({ slug }),
        product: (slug) => paths.products.asPath({ slug }),
      }}
      localePrefixes={localePrefixes}
      defaultLocale={DEFAULT_LOCALE}
      defaultResultsPerPage={DEFAULT_RESULTS_PER_PAGE}
    />
  );
}
