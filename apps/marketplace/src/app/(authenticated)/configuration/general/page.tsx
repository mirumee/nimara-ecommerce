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

      {/* Address Information Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Address Information</CardTitle>
          <Button variant="outline" asChild>
            <Link href="/configuration/general/addresses">
              <Settings className="mr-2 h-4 w-4" /> Manage
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* When shipping same as billing: one combined block */}
            {shippingSameAsBilling && defaultBillingAddress ? (
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-900">
                  Default Shipping & Billing Address
                </label>
                <div className="mt-2 space-y-1">
                  {formatAddress(defaultBillingAddress)?.map((line, idx) => (
                    <div key={idx} className="text-sm text-gray-600">
                      {line}
                    </div>
                  ))}
                  {defaultBillingAddress.phone && (
                    <div className="mt-2 text-sm text-gray-600">
                      {defaultBillingAddress.phone}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <>
                {/* Default Billing Address */}
                <div>
                  <label className="text-sm font-medium text-gray-900">
                    Default Billing Address
                  </label>
                  {defaultBillingAddress ? (
                    <div className="mt-2 space-y-1">
                      {formatAddress(defaultBillingAddress)?.map(
                        (line, idx) => (
                          <div key={idx} className="text-sm text-gray-600">
                            {line}
                          </div>
                        ),
                      )}
                      {defaultBillingAddress.phone && (
                        <div className="mt-2 text-sm text-gray-600">
                          {defaultBillingAddress.phone}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="mt-1 text-sm text-gray-500">Not set</div>
                  )}
                </div>

                {/* Default Shipping Address */}
                <div>
                  <label className="text-sm font-medium text-gray-900">
                    Default Shipping Address
                  </label>
                  {defaultShippingAddress ? (
                    <div className="mt-2 space-y-1">
                      {formatAddress(defaultShippingAddress)?.map(
                        (line, idx) => (
                          <div key={idx} className="text-sm text-gray-600">
                            {line}
                          </div>
                        ),
                      )}
                      {defaultShippingAddress.phone && (
                        <div className="mt-2 text-sm text-gray-600">
                          {defaultShippingAddress.phone}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="mt-1 text-sm text-gray-500">Not set</div>
                  )}
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Cover Photo Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Cover photo</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Recommended dimensions: 1920×512px
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" disabled>
              Delete
            </Button>
            <Button variant="outline" size="sm" disabled>
              <Upload className="mr-2 h-4 w-4" />
              Reupload
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex h-48 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50">
            <span className="text-sm text-muted-foreground">(cover photo)</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
