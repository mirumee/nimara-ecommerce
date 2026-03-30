import { getTranslations } from "next-intl/server";

import { getServerAuthToken } from "@/lib/auth/server";
import { configurationService } from "@/services/configuration";

import { AccountInformationCard } from "./_components/account-information-card";
import { VendorBrandingCard } from "./_components/vendor-branding-card";

export default async function ConfigurationGeneralPage() {
  const t = await getTranslations();
  const token = await getServerAuthToken();
  const result = await configurationService.getMe(token);

  if (!result.ok) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">{t("failed-to-load-user-data")}</p>
      </div>
    );
  }

  const user = result.data.me;

  const vendorPageId = user?.metadata?.find(
    (m) => m.key === "vendor.id",
  )?.value;
  let vendor: {
    backgroundUrl: string | null;
    logoUrl: string | null;
    name: string;
    slug: string;
  } | null = null;

  if (vendorPageId) {
    const vendorResult = await configurationService.getVendorProfile(
      vendorPageId,
      token,
    );

    if (vendorResult.ok && vendorResult.data.page) {
      const page = vendorResult.data.page;
      const vendorNameAttr = page.attributes.find(
        (attr) => attr.attribute.slug === "vendor-name",
      );
      const logoAttr = page.attributes.find(
        (attr) => attr.attribute.slug === "logo",
      );
      const backgroundAttr = page.attributes.find(
        (attr) => attr.attribute.slug === "background-image",
      );

      vendor = {
        backgroundUrl: backgroundAttr?.values[0]?.file?.url ?? null,
        logoUrl: logoAttr?.values[0]?.file?.url ?? null,
        name: vendorNameAttr?.values[0]?.name ?? page.title,
        slug: page.slug,
      };
    }
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold text-gray-900">
        {t("marketplace.configuration.general.heading")}
      </h1>

      {/* Account Information Card */}
      <AccountInformationCard user={user} vendor={vendor} />

      {vendor ? (
        <VendorBrandingCard
          backgroundUrl={vendor.backgroundUrl}
          logoUrl={vendor.logoUrl}
        />
      ) : null}
    </div>
  );
}
