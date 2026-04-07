import { getServerAuthToken } from "@/lib/auth/server";
import { vendorCustomersService } from "@/services";

import { CustomersListClient } from "./_components/customers-list-client";

export default async function CustomersPage() {
  const token = await getServerAuthToken();
  const customers =
    await vendorCustomersService.getVendorCustomersWithOrders(token);

  return <CustomersListClient customers={customers} />;
}
