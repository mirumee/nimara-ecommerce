import { getServerAuthToken } from "@/lib/auth/server";
import { vendorCustomersService } from "@/services";

import { CustomersListClient } from "./_components/customers-list-client";

export default async function CustomersPage() {
  const token = await getServerAuthToken();
  const customers =
    await vendorCustomersService.getVendorCustomersWithOrders(token);

  return (
    <div>
      <h2 className="mb-4 text-2xl font-semibold">Customers</h2>
      <CustomersListClient customers={customers} />
    </div>
  );
}
