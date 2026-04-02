import {
  getConfigurationVendorContext,
  getSidebarVendorDisplay,
} from "../_lib/get-configuration-vendor-context";
import { ConfigurationNavClient } from "./configuration-nav-client";
import { ConfigurationVendorHeaderClient } from "./configuration-vendor-header-client";

export async function ConfigurationSidebarWithVendor() {
  const ctx = await getConfigurationVendorContext();
  const { displayName, vendorUrl } = getSidebarVendorDisplay(ctx);

  return (
    <>
      <ConfigurationVendorHeaderClient
        vendorName={displayName}
        vendorUrl={vendorUrl}
      />
      <ConfigurationNavClient />
    </>
  );
}
