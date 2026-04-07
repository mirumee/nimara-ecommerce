import { getTranslations } from "next-intl/server";

import { config } from "@/lib/config";

import {
  getConfigurationVendorContext,
  mapVendorPageToGeneralVendor,
} from "../_lib/get-configuration-vendor-context";
import { AccountInformationCard } from "./_components/account-information-card";
import { VendorBrandingCard } from "./_components/vendor-branding-card";

export default async function ConfigurationGeneralPage() {
  const t = await getTranslations();
  const ctx = await getConfigurationVendorContext();

  if (!ctx.meOk || !ctx.user) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">{t("failed-to-load-user-data")}</p>
      </div>
    );
  }

  const user = ctx.user;
  const vendor = ctx.vendorPage
    ? mapVendorPageToGeneralVendor(ctx.vendorPage)
    : null;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold text-gray-900">
        {t("marketplace.configuration.general.heading")}
      </h1>

      <AccountInformationCard
        storefrontBaseUrl={config.urls.storefront}
        user={user}
        vendor={vendor}
      />

      {vendor ? (
        <VendorBrandingCard
          backgroundUrl={vendor.backgroundUrl}
          logoUrl={vendor.logoUrl}
        />
      ) : null}
    </div>
  );
}
