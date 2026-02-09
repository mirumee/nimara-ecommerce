import { MoreVertical, Plus } from "lucide-react";
import Link from "next/link";

import { Button } from "@nimara/ui/components/button";
import { Card, CardContent } from "@nimara/ui/components/card";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getServerAuthToken } from "@/lib/auth/server";
import { configurationService } from "@/services/configuration";

export default async function AddressesPage() {
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
  const userName = user
    ? [user.firstName, user.lastName].filter(Boolean).join(" ") ||
      user.email ||
      "User"
    : "User";

  const addresses = user?.addresses || [];

  // Find default addresses
  const defaultBillingAddress = addresses.find(
    (addr) => addr.isDefaultBillingAddress === true,
  );
  const defaultShippingAddress = addresses.find(
    (addr) => addr.isDefaultShippingAddress === true,
  );

  // Shipping is same as billing when:
  // 1. No explicit shipping address exists, OR
  // 2. The shipping address is the same as the billing address
  const shippingSameAsBilling =
    defaultBillingAddress != null &&
    (defaultShippingAddress == null ||
      defaultShippingAddress.id === defaultBillingAddress.id);

  // Other addresses (not defaults)
  // Exclude addresses that are used as defaults
  const otherAddresses = addresses.filter((addr) => {
    const isBillingDefault = addr.id === defaultBillingAddress?.id;
    const isShippingDefault = addr.isDefaultShippingAddress === true;

    return !isBillingDefault && !isShippingDefault;
  });

  // Helper function to get full name
  const getFullName = (address: (typeof addresses)[0]) => {
    return (
      [address.firstName, address.lastName].filter(Boolean).join(" ") ||
      "Unknown"
    );
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Link href="/configuration/general" className="hover:text-gray-900">
          General
        </Link>
        <span>/</span>
        <span className="text-gray-900">Address Book</span>
      </div>

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">
          {userName}&apos;s Address Book
        </h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add address
        </Button>
      </div>

      {/* Addresses Grid - Three Columns */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Default Shipping Address - only when explicitly set and different from billing */}
        {defaultShippingAddress &&
          defaultShippingAddress.id !== defaultBillingAddress?.id && (
            <Card>
              <CardContent className="p-4">
                <div className="mb-3 flex items-start justify-between">
                  <h2 className="text-sm font-semibold text-gray-900">
                    Default Shipping Address
                  </h2>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="text-gray-400 hover:text-gray-600">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        Set as default billing address
                      </DropdownMenuItem>
                      <DropdownMenuItem>Edit Address</DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600 focus:text-red-600">
                        Delete Address
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="space-y-1">
                  <div className="font-medium text-gray-900">
                    {getFullName(defaultShippingAddress)}
                  </div>
                  {defaultShippingAddress.companyName && (
                    <div className="text-sm text-gray-600">
                      {defaultShippingAddress.companyName}
                    </div>
                  )}
                  {defaultShippingAddress.phone && (
                    <div className="text-sm text-gray-600">
                      {defaultShippingAddress.phone}
                    </div>
                  )}
                  {defaultShippingAddress.streetAddress1 && (
                    <div className="text-sm text-gray-600">
                      {defaultShippingAddress.streetAddress1}
                    </div>
                  )}
                  {defaultShippingAddress.streetAddress2 && (
                    <div className="text-sm text-gray-600">
                      {defaultShippingAddress.streetAddress2}
                    </div>
                  )}
                  <div className="text-sm text-gray-600">
                    {[
                      defaultShippingAddress.city,
                      defaultShippingAddress.countryArea,
                      defaultShippingAddress.postalCode,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                    {defaultShippingAddress.country.country &&
                      `, ${defaultShippingAddress.country.country}`}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

        {/* Default Billing Address (or combined when also used for shipping) */}
        {defaultBillingAddress && (
          <Card>
            <CardContent className="p-4">
              <div className="mb-3 flex items-start justify-between">
                <h2 className="text-sm font-semibold text-gray-900">
                  {shippingSameAsBilling
                    ? "Default Shipping & Billing Address"
                    : "Default Billing Address"}
                </h2>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="text-gray-400 hover:text-gray-600">
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      Set as default shipping address
                    </DropdownMenuItem>
                    <DropdownMenuItem>Edit Address</DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600 focus:text-red-600">
                      Delete Address
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="space-y-1">
                <div className="font-medium text-gray-900">
                  {getFullName(defaultBillingAddress)}
                </div>
                {defaultBillingAddress.companyName && (
                  <div className="text-sm text-gray-600">
                    {defaultBillingAddress.companyName}
                  </div>
                )}
                {defaultBillingAddress.phone && (
                  <div className="text-sm text-gray-600">
                    {defaultBillingAddress.phone}
                  </div>
                )}
                {defaultBillingAddress.streetAddress1 && (
                  <div className="text-sm text-gray-600">
                    {defaultBillingAddress.streetAddress1}
                  </div>
                )}
                {defaultBillingAddress.streetAddress2 && (
                  <div className="text-sm text-gray-600">
                    {defaultBillingAddress.streetAddress2}
                  </div>
                )}
                <div className="text-sm text-gray-600">
                  {[
                    defaultBillingAddress.city,
                    defaultBillingAddress.countryArea,
                    defaultBillingAddress.postalCode,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                  {defaultBillingAddress.country.country &&
                    `, ${defaultBillingAddress.country.country}`}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Other Addresses */}
        {otherAddresses.map((address) => (
          <Card key={address.id}>
            <CardContent className="p-4">
              <div className="mb-3 flex items-start justify-between">
                <div className="flex-1" />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="text-gray-400 hover:text-gray-600">
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      Set as default shipping address
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      Set as default billing address
                    </DropdownMenuItem>
                    <DropdownMenuItem>Edit Address</DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600 focus:text-red-600">
                      Delete Address
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="space-y-1">
                <div className="font-medium text-gray-900">
                  {getFullName(address)}
                </div>
                {address.companyName && (
                  <div className="text-sm text-gray-600">
                    {address.companyName}
                  </div>
                )}
                {address.phone && (
                  <div className="text-sm text-gray-600">{address.phone}</div>
                )}
                {address.streetAddress1 && (
                  <div className="text-sm text-gray-600">
                    {address.streetAddress1}
                  </div>
                )}
                {address.streetAddress2 && (
                  <div className="text-sm text-gray-600">
                    {address.streetAddress2}
                  </div>
                )}
                <div className="text-sm text-gray-600">
                  {[address.city, address.countryArea, address.postalCode]
                    .filter(Boolean)
                    .join(", ")}
                  {address.country.country && `, ${address.country.country}`}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Empty State */}
        {addresses.length === 0 && (
          <div className="col-span-full py-12 text-center">
            <p className="text-gray-500">
              No addresses found. Add your first address to get started.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
