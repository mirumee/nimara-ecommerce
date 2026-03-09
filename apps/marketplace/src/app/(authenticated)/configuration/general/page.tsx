import { Settings, Upload } from "lucide-react";
import Link from "next/link";

import { Button } from "@nimara/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@nimara/ui/components/card";

import type { Me_me_User_addresses_Address } from "@/graphql/generated/client";
import { getServerAuthToken } from "@/lib/auth/server";
import { configurationService } from "@/services/configuration";

import { AccountInformationCard } from "./_components/account-information-card";

export default async function ConfigurationGeneralPage() {
  const token = await getServerAuthToken();
  const result = await configurationService.getMe(token);

  if (!result.ok) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Failed to load user data</p>
      </div>
    );
  }

  const user = result.data.me;

  const vendorPageId = user?.metadata?.find(
    (m) => m.key === "vendor.id",
  )?.value;
  let vendor: { name: string; slug: string } | null = null;

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

      vendor = {
        name: vendorNameAttr?.values[0]?.name ?? page.title,
        slug: page.slug,
      };
    }
  }

  // Find default addresses
  const defaultBillingAddress = user?.addresses?.find(
    (addr) => addr.isDefaultBillingAddress === true,
  );
  const defaultShippingAddress = user?.addresses?.find(
    (addr) => addr.isDefaultShippingAddress === true,
  );

  // Shipping is same as billing when:
  // 1. No explicit shipping address exists, OR
  // 2. The shipping address is the same as the billing address
  const shippingSameAsBilling =
    defaultBillingAddress != null &&
    (defaultShippingAddress == null ||
      defaultShippingAddress.id === defaultBillingAddress.id);

  // Helper function to format address
  const formatAddress = (address: Me_me_User_addresses_Address | undefined) => {
    if (!address) {
      return null;
    }

    const parts = [
      address.streetAddress1,
      address.streetAddress2,
      `${address.city}, ${address.countryArea || ""} ${address.postalCode}`.trim(),
      address.country.country,
    ].filter(Boolean);

    return parts;
  };

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold text-gray-900">General</h1>

      {/* Account Information Card */}
      <AccountInformationCard user={user} vendor={vendor} />
    </div>
  );
}
