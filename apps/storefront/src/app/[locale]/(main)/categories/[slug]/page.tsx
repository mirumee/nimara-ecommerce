import { generateStandardCategoryMetadata } from "@nimara/features/category/shared/metadata/standard-metadata";
import { type CategoryViewProps } from "@nimara/features/category/shared/types";
import { StandardCategoryView } from "@nimara/features/category/shop-basic-category/standard";
import { DEFAULT_LOCALE, LOCALE_PREFIXES } from "@nimara/i18n/config";

import { DEFAULT_RESULTS_PER_PAGE, DEFAULT_SORT_BY } from "@/config";
import { clientEnvs } from "@/envs/client";
import { getCurrentRegion } from "@/foundation/regions";
import { paths } from "@/foundation/routing/paths";
import { getServiceRegistry } from "@/services/registry";

import { handleCategoryFiltersFormSubmit } from "./_actions/handle-category-filters-form-submit";

export async function generateMetadata(props: CategoryViewProps) {
  const [services, region, { slug }] = await Promise.all([
    getServiceRegistry(),
    getCurrentRegion(),
    props.params,
  ]);
  const storefrontUrl = clientEnvs.NEXT_PUBLIC_STOREFRONT_URL;
  const categoryPath = paths.categories.asPath({ slug });

  return generateStandardCategoryMetadata({
    ...props,
    services,
    storefrontUrl,
    categoryPath,
    languageCode: region.language.code,
    siteName: clientEnvs.NEXT_PUBLIC_DEFAULT_PAGE_TITLE,
  });
}

export default async function Page(props: CategoryViewProps) {
  const [services, region, { slug }] = await Promise.all([
    getServiceRegistry(),
    getCurrentRegion(),
    props.params,
  ]);

  return (
    <StandardCategoryView
      {...props}
      region={region}
      services={services}
      paths={{
        home: paths.home.asPath(),
        category: (slug) => paths.categories.asPath({ slug }),
        product: (slug) => paths.products.asPath({ slug }),
      }}
      localePrefixes={LOCALE_PREFIXES}
      defaultLocale={DEFAULT_LOCALE}
      defaultResultsPerPage={DEFAULT_RESULTS_PER_PAGE}
      defaultSortBy={DEFAULT_SORT_BY}
      handleFiltersFormSubmit={handleCategoryFiltersFormSubmit.bind(null, slug)}
    />
  );
}
