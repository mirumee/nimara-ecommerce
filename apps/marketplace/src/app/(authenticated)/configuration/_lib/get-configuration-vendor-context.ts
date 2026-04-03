import { cache } from "react";

import type {
  Me_me_User,
  VendorPageStatus_page_Page,
} from "@/graphql/generated/client";
import { getServerAuthToken } from "@/lib/auth/server";
import { config } from "@/lib/config";
import { buildVendorStorefrontUrl } from "@/lib/vendor-storefront-url";
import { configurationService } from "@/services/configuration";

export type ConfigurationVendorContext = {
  meOk: boolean;
  user: Me_me_User | null;
  vendorPage: VendorPageStatus_page_Page | null;
};

/**
 * Loads current user and optional vendor CMS page once per request.
 * Deduplicates GraphQL when layout sidebar and configuration pages both need the same data.
 */
export const getConfigurationVendorContext = cache(
  async (): Promise<ConfigurationVendorContext> => {
    const token = await getServerAuthToken();
    const result = await configurationService.getMe(token);

    if (!result.ok || !result.data.me) {
      return { meOk: false, user: null, vendorPage: null };
    }

    const user = result.data.me;
    const vendorPageId = user.metadata?.find(
      (m) => m.key === "vendor.id",
    )?.value;

    if (!vendorPageId) {
      return { meOk: true, user, vendorPage: null };
    }

    const vendorResult = await configurationService.getVendorProfile(
      vendorPageId,
      token,
    );

    const vendorPage =
      vendorResult.ok && vendorResult.data.page ? vendorResult.data.page : null;

    return { meOk: true, user, vendorPage };
  },
);

export function getSidebarVendorDisplay(ctx: ConfigurationVendorContext): {
  displayName: string;
  vendorUrl: string;
} {
  const user = ctx.user;
  const page = ctx.vendorPage;

  const vendorNameAttr = page?.attributes.find(
    (attr) => attr.attribute.slug === "vendor-name",
  );
  const vendorName = vendorNameAttr?.values[0]?.name ?? page?.title;
  const vendorSlug = page?.slug;

  const displayName =
    vendorName || user?.firstName || user?.email || "Vendor name";

  const vendorUrl = buildVendorStorefrontUrl(config.urls.storefront, {
    nameFallback: displayName,
    slug: vendorSlug,
  });

  return { displayName, vendorUrl };
}

export type GeneralPageVendor = {
  backgroundUrl: string | null;
  logoUrl: string | null;
  name: string;
  slug: string;
};

export function mapVendorPageToGeneralVendor(
  page: VendorPageStatus_page_Page,
): GeneralPageVendor {
  const vendorNameAttr = page.attributes.find(
    (attr) => attr.attribute.slug === "vendor-name",
  );
  const logoAttr = page.attributes.find(
    (attr) => attr.attribute.slug === "logo",
  );
  const backgroundAttr = page.attributes.find(
    (attr) => attr.attribute.slug === "background-image",
  );

  return {
    backgroundUrl: backgroundAttr?.values[0]?.file?.url ?? null,
    logoUrl: logoAttr?.values[0]?.file?.url ?? null,
    name: vendorNameAttr?.values[0]?.name ?? page.title,
    slug: page.slug,
  };
}
