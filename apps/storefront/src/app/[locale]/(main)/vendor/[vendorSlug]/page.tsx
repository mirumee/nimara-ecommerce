import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { type Locale } from "next-intl";
import { cache } from "react";

import type { CMSPage, PageField } from "@nimara/domain/objects/CMSPage";
import { VendorSearchView } from "@nimara/features/search/shop-basic-plp/vendor-standard";
import { DEFAULT_LOCALE, LOCALE_PREFIXES } from "@nimara/i18n/config";

import { CACHE_TTL, DEFAULT_RESULTS_PER_PAGE, DEFAULT_SORT_BY } from "@/config";
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
 * Unpublished vendor pages are invisible to the anonymous `page` API. Retry with the app token
 * so active vendors are still reachable on the storefront (sign-up creates pages with isPublished: false).
 */
function isVendorVisibleOnStorefront(
  fields: PageField[],
  usedElevatedFetch: boolean,
): boolean {
  const status = fieldText(fields, VENDOR_STATUS_ATTR)?.toLowerCase();

  if (status === "active") {
    return true;
  }

  // Public, published page with no status attribute (legacy).
  if (!usedElevatedFetch && (status == null || status === "")) {
    return true;
  }

  return false;
}

const loadVendorProfilePage = cache(
  async (
    vendorSlug: string,
    languageCode: string,
  ): Promise<{ page: CMSPage | null; usedElevatedFetch: boolean }> => {
    const services = await getServiceRegistry();
    const cmsService = await services.getCMSPageService();
    const cmsTag = `CMS:${vendorSlug}` as RevalidateTag;
    const options = {
      next: {
        tags: [cmsTag],
        revalidate: CACHE_TTL.cms,
      },
    };

    const publicResult = await cmsService.cmsPageGet({
      slug: vendorSlug,
      languageCode,
      options,
    });

    if (publicResult.ok && publicResult.data) {
      return { page: publicResult.data, usedElevatedFetch: false };
    }

    const staffResult = await cmsService.cmsPageGet({
      slug: vendorSlug,
      languageCode,
      options,
      accessToken: serverEnvs.SALEOR_APP_TOKEN,
    });

    if (staffResult.ok && staffResult.data) {
      return { page: staffResult.data, usedElevatedFetch: true };
    }

    return { page: null, usedElevatedFetch: true };
  },
);

function assertValidVendorPage(
  page: CMSPage | null,
  usedElevatedFetch: boolean,
): asserts page is CMSPage & { id: string } {
  if (
    !page?.id ||
    page.pageTypeSlug !== VENDOR_PROFILE_PAGE_TYPE_SLUG ||
    !isVendorVisibleOnStorefront(page.fields, usedElevatedFetch)
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
  const { page, usedElevatedFetch } = await loadVendorProfilePage(
    vendorSlug,
    region.language.code,
  );

  assertValidVendorPage(page, usedElevatedFetch);

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

  const { page, usedElevatedFetch } = await loadVendorProfilePage(
    vendorSlug,
    region.language.code,
  );

  assertValidVendorPage(page, usedElevatedFetch);

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
