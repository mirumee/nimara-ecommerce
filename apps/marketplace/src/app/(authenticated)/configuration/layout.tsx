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
  const vendorName = user?.firstName || user?.email || "Vendor name";
  const vendorUrl = `marketplace.com/${String(vendorName).toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <ConfigurationLayoutClient vendorName={vendorName} vendorUrl={vendorUrl}>
      {children}
    </ConfigurationLayoutClient>
  );
}
