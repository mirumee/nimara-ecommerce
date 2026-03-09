import { getServerAuthToken } from "@/lib/auth/server";
import { configurationService } from "@/services/configuration";

import { ConfigurationLayoutClient } from "./_components/configuration-layout-client";

export default async function ConfigurationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = await getServerAuthToken();
  const result = await configurationService.getMe(token);

  const user = result.ok ? result.data.me : null;

  const vendorPageId = user?.metadata?.find(
    (m) => m.key === "vendor.id",
  )?.value;
  let vendorName: string | undefined;
  let vendorSlug: string | undefined;

  if (vendorPageId) {
    const vendorResult = await configurationService.getVendorProfile(
      vendorPageId,
      token,
    );

    if (vendorResult.ok && vendorResult.data.page) {
      const vendorNameAttr = vendorResult.data.page.attributes.find(
        (attr) => attr.attribute.slug === "vendor-name",
      );

      vendorName =
        vendorNameAttr?.values[0]?.name ?? vendorResult.data.page.title;
      vendorSlug = vendorResult.data.page.slug;
    }
  }

  const displayName =
    vendorName || user?.firstName || user?.email || "Vendor name";
  const vendorUrl = vendorSlug
    ? `marketplace.com/${vendorSlug}`
    : `marketplace.com/${String(displayName).toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <ConfigurationLayoutClient vendorName={displayName} vendorUrl={vendorUrl}>
      {children}
    </ConfigurationLayoutClient>
  );
}
