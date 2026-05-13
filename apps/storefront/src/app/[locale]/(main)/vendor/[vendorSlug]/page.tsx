import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { type Locale } from "next-intl";
import { cache } from "react";

import type { VendorProfile } from "@nimara/domain/objects/VendorProfile";
import { VendorSearchView } from "@nimara/features/search/shop-basic-plp/vendor-standard";
import { DEFAULT_LOCALE, LOCALE_PREFIXES } from "@nimara/i18n/config";

import { DEFAULT_RESULTS_PER_PAGE, DEFAULT_SORT_BY } from "@/config";
import { clientEnvs } from "@/envs/client";
import { getCurrentRegion } from "@/foundation/regions";
import { paths } from "@/foundation/routing/paths";
import { getServiceRegistry } from "@/services/registry";

import { handleVendorFiltersFormSubmit } from "./_actions/handle-vendor-filters-form-submit";

const loadVendorProfile = cache(
  async (
    vendorSlug: string,
    languageCode: string,
  ): Promise<{ vendor: VendorProfile | null }> => {
    const services = await getServiceRegistry();
    const storeService = await services.getStoreService();
    const result = await storeService.getVendorProfileBySlug({
      vendorSlug,
      languageCode,
      options: {
        cache: "no-store",
      },
    });

    return { vendor: result.ok ? (result.data.vendor ?? null) : null };
  },
);

function assertValidVendor(
  vendor: VendorProfile | null,
): asserts vendor is VendorProfile {
  if (!vendor || !vendor.isActive) {
    notFound();
  }
}

type VendorPageProps = {
  params: Promise<{ locale: Locale; vendorSlug: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
};

export async function generateMetadata(
  props: VendorPageProps,
): Promise<Metadata> {
  if (!clientEnvs.NEXT_PUBLIC_MARKETPLACE_ENABLED) {
    notFound();
  }

  const { vendorSlug } = await props.params;
  const region = await getCurrentRegion();
  const { vendor } = await loadVendorProfile(vendorSlug, region.language.code);

  assertValidVendor(vendor);

  return {
    title: `${vendor.displayName} | ${clientEnvs.NEXT_PUBLIC_DEFAULT_PAGE_TITLE}`,
  };
}

export default async function Page(props: VendorPageProps) {
  if (!clientEnvs.NEXT_PUBLIC_MARKETPLACE_ENABLED) {
    notFound();
  }

  const { vendorSlug } = await props.params;
  const [services, region] = await Promise.all([
    getServiceRegistry(),
    getCurrentRegion(),
  ]);

  const { vendor } = await loadVendorProfile(vendorSlug, region.language.code);

  assertValidVendor(vendor);

  return (
    <VendorSearchView
      {...props}
      region={region}
      services={services}
      paths={{
        home: paths.home.asPath(),
        listing: paths.vendor.asPath({ vendorSlug }),
        product: (slug) => paths.products.asPath({ slug }),
      }}
      localePrefixes={LOCALE_PREFIXES}
      defaultLocale={DEFAULT_LOCALE}
      defaultResultsPerPage={DEFAULT_RESULTS_PER_PAGE}
      defaultSortBy={DEFAULT_SORT_BY}
      handleFiltersFormSubmit={handleVendorFiltersFormSubmit.bind(
        null,
        vendorSlug,
      )}
      productMetadata={[{ key: "vendor.id", value: vendor.id }]}
      vendorBranding={{
        displayTitle: vendor.displayName,
        backgroundImageUrl: vendor.backgroundImageUrl,
        logoUrl: vendor.logoUrl,
      }}
    />
  );
}
