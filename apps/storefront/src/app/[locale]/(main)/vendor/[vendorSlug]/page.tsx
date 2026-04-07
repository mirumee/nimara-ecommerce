import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { type Locale } from "next-intl";
import { cache } from "react";

import type { CMSPage, PageField } from "@nimara/domain/objects/CMSPage";
import { VendorSearchView } from "@nimara/features/search/shop-basic-plp/vendor-standard";
import { DEFAULT_LOCALE, LOCALE_PREFIXES } from "@nimara/i18n/config";

import { DEFAULT_RESULTS_PER_PAGE, DEFAULT_SORT_BY } from "@/config";
import { clientEnvs } from "@/envs/client";
import { serverEnvs } from "@/envs/server";
import { getCurrentRegion } from "@/foundation/regions";
import { paths } from "@/foundation/routing/paths";
import { getServiceRegistry } from "@/services/registry";

import { handleVendorFiltersFormSubmit } from "./_actions/handle-vendor-filters-form-submit";

const VENDOR_PROFILE_PAGE_TYPE_SLUG = "vendor-profile";
const VENDOR_PAGE_ATTR_LOGO = "logo";
const VENDOR_PAGE_ATTR_BACKGROUND = "background-image";
const VENDOR_PAGE_ATTR_NAME = "vendor-name";
const VENDOR_STATUS_ATTR = "vendor-status";

function fieldImageUrl(fields: PageField[], slug: string): string | undefined {
  const url = fields.find((f) => f.slug === slug)?.imageUrl;

  return url?.trim() || undefined;
}

function fieldText(fields: PageField[], slug: string): string | undefined {
  const text = fields.find((f) => f.slug === slug)?.text?.trim();

  return text || undefined;
}

/**
 * Vendor storefront visibility is gated on two conditions:
 * 1. `NEXT_PUBLIC_MARKETPLACE_ENABLED=true`
 * 2. `vendor-status=active`
 * Saleor publish/draft state has no effect.
 */
function isVendorActive(fields: PageField[]): boolean {
  return fieldText(fields, VENDOR_STATUS_ATTR)?.toLowerCase() === "active";
}

const loadVendorProfilePage = cache(
  async (
    vendorSlug: string,
    languageCode: string,
  ): Promise<{ page: CMSPage | null }> => {
    const services = await getServiceRegistry();
    const cmsService = await services.getCMSPageService();

    /**
     * Always fetch with the app token (MANAGE_PAGES) so that vendor pages in "draft" state are
     * still reachable. Publish/draft state is irrelevant — visibility is gated solely on
     * vendor-status=active in assertValidVendorPage below.
     */
    const result = await cmsService.cmsPageGet({
      slug: vendorSlug,
      languageCode,
      options: {
        cache: "no-store",
      },
      accessToken: serverEnvs.SALEOR_APP_TOKEN,
    });

    return { page: result.ok ? (result.data ?? null) : null };
  },
);

function assertValidVendorPage(
  page: CMSPage | null,
): asserts page is CMSPage & { id: string } {
  if (
    !page?.id ||
    page.pageTypeSlug !== VENDOR_PROFILE_PAGE_TYPE_SLUG ||
    !isVendorActive(page.fields)
  ) {
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
  const { page } = await loadVendorProfilePage(
    vendorSlug,
    region.language.code,
  );

  assertValidVendorPage(page);

  const displayTitle =
    fieldText(page.fields, VENDOR_PAGE_ATTR_NAME) ?? page.title;

  return {
    title: `${displayTitle} | ${clientEnvs.NEXT_PUBLIC_DEFAULT_PAGE_TITLE}`,
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

  const { page } = await loadVendorProfilePage(
    vendorSlug,
    region.language.code,
  );

  assertValidVendorPage(page);

  const displayTitle =
    fieldText(page.fields, VENDOR_PAGE_ATTR_NAME) ?? page.title;

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
      productMetadata={[{ key: "vendor.id", value: page.id }]}
      vendorBranding={{
        displayTitle,
        backgroundImageUrl: fieldImageUrl(
          page.fields,
          VENDOR_PAGE_ATTR_BACKGROUND,
        ),
        logoUrl: fieldImageUrl(page.fields, VENDOR_PAGE_ATTR_LOGO),
      }}
    />
  );
}
