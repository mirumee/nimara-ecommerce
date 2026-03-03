import { generateStandardCollectionMetadata } from "@nimara/features/collection/shared/metadata/standard-metadata";
import { type CollectionViewProps } from "@nimara/features/collection/shared/types";
import { StandardCollectionView } from "@nimara/features/collection/shop-basic-collection/standard";
import { DEFAULT_LOCALE, LOCALE_PREFIXES } from "@nimara/i18n/config";

import { DEFAULT_RESULTS_PER_PAGE } from "@/config";
import { clientEnvs } from "@/envs/client";
import { getCurrentRegion } from "@/foundation/regions";
import { paths } from "@/foundation/routing/paths";
import { getServiceRegistry } from "@/services/registry";

export async function generateMetadata(props: CollectionViewProps) {
  const [services, region] = await Promise.all([
    getServiceRegistry(),
    getCurrentRegion(),
  ]);
  const { slug } = await props.params;
  const storefrontUrl = clientEnvs.NEXT_PUBLIC_STOREFRONT_URL;
  const collectionPath = paths.collections.asPath({ slug });

  return generateStandardCollectionMetadata({
    ...props,
    services,
    storefrontUrl,
    collectionPath,
    channel: region.market.channel,
    languageCode: region.language.code,
    defaultResultsPerPage: DEFAULT_RESULTS_PER_PAGE,
  });
}

export default async function Page(props: CollectionViewProps) {
  const [services, region] = await Promise.all([
    getServiceRegistry(),
    getCurrentRegion(),
  ]);

  return (
    <StandardCollectionView
      {...props}
      channel={region.market.channel}
      languageCode={region.language.code}
      services={services}
      paths={{
        home: paths.home.asPath(),
        collection: (slug) => paths.collections.asPath({ slug }),
        product: (slug) => paths.products.asPath({ slug }),
      }}
      localePrefixes={LOCALE_PREFIXES}
      defaultLocale={DEFAULT_LOCALE}
      defaultResultsPerPage={DEFAULT_RESULTS_PER_PAGE}
    />
  );
}
