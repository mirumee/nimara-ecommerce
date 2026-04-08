import { type LanguageCodeEnum } from "@nimara/codegen/schema";
import { ok } from "@nimara/domain/objects/Result";
import type { VendorProfile } from "@nimara/domain/objects/VendorProfile";

import {
  type Page_page_Page,
  PageDocument,
} from "#root/cms-page/saleor/graphql/queries/generated";
import { graphqlClient } from "#root/graphql/client";
import { getTranslation } from "#root/lib/saleor";
import type {
  GetVendorProfileBySlugInfra,
  StoreServiceConfig,
} from "#root/store/types";

const VENDOR_STATUS_ATTRIBUTE_SLUG = "vendor-status";
const VENDOR_STATUS_ATTRIBUTE_SLUG_ALT = "vendor_status";
const VENDOR_STATUS_ATTRIBUTE_SLUG_LEGACY = "status";
const VENDOR_PROFILE_PAGE_TYPE_SLUG = "vendor-profile";
const VENDOR_NAME_ATTRIBUTE_SLUG = "vendor-name";
const VENDOR_LOGO_ATTRIBUTE_SLUG = "logo";
const VENDOR_BACKGROUND_ATTRIBUTE_SLUG = "background-image";

function getFirstAttributeValue(page: Page_page_Page, attributeSlug: string) {
  return page.attributes.find((a) => a.attribute.slug === attributeSlug)
    ?.values[0];
}

function getTextAttribute(
  page: Page_page_Page,
  attributeSlug: string,
): string | undefined {
  const value = getFirstAttributeValue(page, attributeSlug);
  const text =
    getTranslation("plainText", value)?.trim() ||
    value?.value?.trim() ||
    value?.slug?.trim() ||
    value?.name?.trim() ||
    undefined;

  return text || undefined;
}

function getFirstAvailableTextAttribute(
  page: Page_page_Page,
  attributeSlugs: string[],
): string | undefined {
  for (const attributeSlug of attributeSlugs) {
    const text = getTextAttribute(page, attributeSlug);

    if (text) {
      return text;
    }
  }

  return undefined;
}

function getImageAttribute(
  page: Page_page_Page,
  attributeSlug: string,
): string | undefined {
  const url = getFirstAttributeValue(page, attributeSlug)?.file?.url?.trim();

  return url || undefined;
}

function serializeVendorProfile(
  page: Page_page_Page,
  vendorSlug: string,
): VendorProfile {
  const status = getFirstAvailableTextAttribute(page, [
    VENDOR_STATUS_ATTRIBUTE_SLUG,
    VENDOR_STATUS_ATTRIBUTE_SLUG_ALT,
    VENDOR_STATUS_ATTRIBUTE_SLUG_LEGACY,
  ]);
  const displayName =
    getTextAttribute(page, VENDOR_NAME_ATTRIBUTE_SLUG) || page.title;

  return {
    id: page.id,
    slug: vendorSlug,
    displayName,
    isActive: status?.toLowerCase() === "active",
    logoUrl: getImageAttribute(page, VENDOR_LOGO_ATTRIBUTE_SLUG),
    backgroundImageUrl: getImageAttribute(
      page,
      VENDOR_BACKGROUND_ATTRIBUTE_SLUG,
    ),
  };
}

function isVendorProfilePage(page: Page_page_Page): boolean {
  return page.pageType.slug === VENDOR_PROFILE_PAGE_TYPE_SLUG;
}

export const getVendorProfileBySlugInfra =
  ({
    apiURI,
    saleorAppToken,
  }: StoreServiceConfig): GetVendorProfileBySlugInfra =>
  async ({ vendorSlug, languageCode, options }) => {
    const candidateSlugs = Array.from(
      new Set([vendorSlug, vendorSlug.toLowerCase()]),
    );

    const executeQuery = (slug: string, accessToken?: string | null) =>
      graphqlClient(apiURI, accessToken).execute(PageDocument, {
        operationName: "PageQuery",
        options: accessToken
          ? { ...options, next: undefined, cache: "no-store" as const }
          : options,
        variables: {
          slug,
          languageCode: languageCode as LanguageCodeEnum,
        },
      });

    const findFirstPage = async (accessToken?: string | null) => {
      for (const candidateSlug of candidateSlugs) {
        const result = await executeQuery(candidateSlug, accessToken);

        if (
          result.ok &&
          result.data.page &&
          isVendorProfilePage(result.data.page)
        ) {
          return { page: result.data.page, resolvedSlug: candidateSlug };
        }
      }

      return { page: null, resolvedSlug: vendorSlug };
    };

    const { page: elevatedPage, resolvedSlug: elevatedResolvedSlug } =
      saleorAppToken
        ? await findFirstPage(saleorAppToken)
        : await findFirstPage();

    if (elevatedPage) {
      return ok({
        vendor: serializeVendorProfile(elevatedPage, elevatedResolvedSlug),
      });
    }

    if (!saleorAppToken) {
      return ok({ vendor: null });
    }

    const { page: publicPage, resolvedSlug: publicResolvedSlug } =
      await findFirstPage();

    return ok({
      vendor: publicPage
        ? serializeVendorProfile(publicPage, publicResolvedSlug)
        : null,
    });
  };
