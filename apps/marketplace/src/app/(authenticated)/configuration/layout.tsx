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
  // Get vendor name from metadata, fallback to firstName or email
  const vendorNameMetadata = user?.metadata?.find(
    (m) => m.key === "vendor.name",
  );
  const vendorName =
    vendorNameMetadata?.value ||
    user?.firstName ||
    user?.email ||
    "Vendor name";
  const vendorUrl = `marketplace.com/${String(vendorName).toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <ConfigurationLayoutClient vendorName={vendorName} vendorUrl={vendorUrl}>
      {children}
    </ConfigurationLayoutClient>
  );
}
