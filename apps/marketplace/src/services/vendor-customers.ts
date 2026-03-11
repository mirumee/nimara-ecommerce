import {
  type CustomerOrders,
  CustomerOrdersDocument,
  type CustomerOrdersVariables,
  type CustomersByIds,
  CustomersByIdsDocument,
  type CustomersByIdsVariables,
  MeDocument,
  type VendorCustomerIds,
  VendorCustomerIdsDocument,
  type VendorCustomerIdsVariables,
} from "@/graphql/generated/client";
import { executeGraphQL } from "@/lib/graphql/execute";
import { METADATA_KEYS } from "@/lib/saleor/consts";
import { parseVendorCustomerIds } from "@/lib/saleor/customer-ids";

export type VendorCustomerOrder = {
  created: string | null;
  id: string;
  number: string | null;
  paymentStatusDisplay: string | null;
  statusDisplay: string | null;
  total: {
    amount: number;
    currency: string;
  } | null;
};

export type VendorCustomerWithOrders = {
  email: string;
  firstName: string;
  id: string;
  lastName: string;
  orders: VendorCustomerOrder[];
};

class VendorCustomersService {
  async getVendorCustomerIds(token?: string | null): Promise<string[]> {
    const vendorId = await this.getCurrentVendorId(token);

    if (!vendorId) {
      return [];
    }

    const variables: VendorCustomerIdsVariables = { id: vendorId };
    const vendorMetaResult = await executeGraphQL<
      VendorCustomerIds,
      VendorCustomerIdsVariables
    >(VendorCustomerIdsDocument, "VendorCustomerIdsQuery", variables, token);

    if (!vendorMetaResult.ok) {
      return [];
    }

    const rawValue =
      vendorMetaResult.data.page?.metadata?.find(
        (item) => item.key === METADATA_KEYS.VENDOR_CUSTOMERS,
      )?.value ?? null;

    return parseVendorCustomerIds(rawValue);
  }

  async getVendorCustomersWithOrders(
    token?: string | null,
  ): Promise<VendorCustomerWithOrders[]> {
    const customerIds = await this.getVendorCustomerIds(token);

    if (customerIds.length === 0) {
      return [];
    }

    const customers = await this.getCustomersByIds(customerIds, token);

    if (customers.length === 0) {
      return [];
    }

    const ordersByCustomer = await Promise.all(
      customers.map(async (customer) => ({
        customerId: customer.id,
        orders: await this.getCustomerOrders(customer.id, token),
      })),
    );

    const orderMap = new Map(
      ordersByCustomer.map((entry) => [entry.customerId, entry.orders]),
    );

    return customers.map((customer) => ({
      ...customer,
      orders: orderMap.get(customer.id) ?? [],
    }));
  }

  private async getCurrentVendorId(
    token?: string | null,
  ): Promise<string | null> {
    const meResult = await executeGraphQL(
      MeDocument,
      "MeQuery",
      undefined,
      token,
    );

    if (!meResult.ok) {
      return null;
    }

    return (
      meResult.data.me?.metadata?.find(
        (metadata) => metadata.key === METADATA_KEYS.VENDOR_ID,
      )?.value ?? null
    );
  }

  private async getCustomersByIds(
    customerIds: string[],
    token?: string | null,
  ): Promise<VendorCustomerWithOrders[]> {
    const variables: CustomersByIdsVariables = {
      first: Math.max(customerIds.length, 20),
      ids: customerIds,
    };
    const customersResult = await executeGraphQL<
      CustomersByIds,
      CustomersByIdsVariables
    >(CustomersByIdsDocument, "CustomersByIdsQuery", variables, token);

    if (!customersResult.ok) {
      return [];
    }

    return (
      customersResult.data.customers?.edges
        ?.map((edge) => edge.node)
        .filter(Boolean)
        .map((customer) => ({
          email: customer.email,
          firstName: customer.firstName ?? "",
          id: customer.id,
          lastName: customer.lastName ?? "",
          orders: [],
        })) ?? []
    );
  }

  private async getCustomerOrders(
    customerId: string,
    token?: string | null,
  ): Promise<VendorCustomerOrder[]> {
    const variables: CustomerOrdersVariables = {
      customer: customerId,
      first: 20,
    };
    const ordersResult = await executeGraphQL<
      CustomerOrders,
      CustomerOrdersVariables
    >(CustomerOrdersDocument, "CustomerOrdersQuery", variables, token);

    if (!ordersResult.ok) {
      return [];
    }

    return (
      ordersResult.data.orders?.edges
        ?.map((edge) => edge.node)
        .filter(Boolean)
        .map((order) => ({
          created: order.created ?? null,
          id: order.id,
          number: order.number ?? null,
          paymentStatusDisplay: order.paymentStatusDisplay ?? null,
          statusDisplay: order.statusDisplay ?? null,
          total: order.total?.gross
            ? {
                amount: order.total.gross.amount,
                currency: order.total.gross.currency,
              }
            : null,
        })) ?? []
    );
  }
}

export const vendorCustomersService = new VendorCustomersService();
