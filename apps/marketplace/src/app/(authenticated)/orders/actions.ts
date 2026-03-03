"use server";

import { revalidatePath } from "next/cache";

import {
  ChannelShippingMethodsPerCountryDocument,
  type ChannelShippingMethodsPerCountryVariables,
  type CountryCode,
  CustomerByEmailDocument,
  type CustomerByEmailVariables,
  DraftOrderCompleteMutationDocument,
  type DraftOrderCompleteMutationVariables,
  type DraftOrderCreateInput,
  DraftOrderCreateMutationDocument,
  type DraftOrderCreateMutationVariables,
  DraftOrderDeleteMutationDocument,
  type DraftOrderDeleteMutationVariables,
  type DraftOrderInput,
  DraftOrderUpdateMutationDocument,
  type DraftOrderUpdateMutationVariables,
  OrderDiscountAddMutationDocument,
  type OrderDiscountAddMutationVariables,
  type OrderDiscountCommonInput,
  OrderDiscountDeleteMutationDocument,
  type OrderDiscountDeleteMutationVariables,
  OrderDiscountUpdateMutationDocument,
  type OrderDiscountUpdateMutationVariables,
  type OrderLineCreateInput,
  OrderLineDeleteMutationDocument,
  type OrderLineDeleteMutationVariables,
  type OrderLineInput,
  OrderLinesCreateMutationDocument,
  type OrderLinesCreateMutationVariables,
  OrderLineUpdateMutationDocument,
  type OrderLineUpdateMutationVariables,
  type OrderUpdateInput,
  OrderUpdateMutationDocument,
  type OrderUpdateMutationVariables,
  type ProductDetailVariables,
  type ProductsVariables,
} from "@/graphql/generated/client";
import { getServerAuthToken } from "@/lib/auth/server";
import { executeGraphQL } from "@/lib/graphql/execute";
import { productsService, vendorCustomersService } from "@/services";

export async function searchCustomers(search: string) {
  const token = await getServerAuthToken();
  const customerIds = await vendorCustomersService.getVendorCustomerIds(token);

  if (customerIds.length === 0) {
    const variables: CustomerByEmailVariables = { ids: [], search };

    return executeGraphQL(
      CustomerByEmailDocument,
      "CustomerByEmailQuery",
      variables,
      token,
    );
  }

  const variables: CustomerByEmailVariables = { ids: customerIds, search };

  return executeGraphQL(
    CustomerByEmailDocument,
    "CustomerByEmailQuery",
    variables,
    token,
  );
}

export async function getProductsForOrder(options?: {
  first?: number;
  search?: string;
}) {
  const token = await getServerAuthToken();
  const variables: ProductsVariables = {
    first: options?.first ?? 50,
    search: options?.search?.trim() || undefined,
  };

  return productsService.getProducts(variables, token);
}

export async function searchProducts(search: string) {
  return getProductsForOrder({ first: 10, search: search || undefined });
}

export async function getProductDetail(productId: string) {
  const token = await getServerAuthToken();
  const variables: ProductDetailVariables = {
    id: productId,
  };

  return productsService.getProduct(variables, token);
}

export async function getChannelShippingMethods(
  channelId: string,
  countryCode: string,
) {
  const token = await getServerAuthToken();

  const variables: ChannelShippingMethodsPerCountryVariables = {
    channelId,
    countries: [countryCode as CountryCode],
  };

  return executeGraphQL(
    ChannelShippingMethodsPerCountryDocument,
    "ChannelShippingMethodsPerCountryQuery",
    variables,
    token,
  );
}

export async function createDraftOrder(input: DraftOrderCreateInput) {
  const token = await getServerAuthToken();
  const variables: DraftOrderCreateMutationVariables = { input };

  return executeGraphQL(
    DraftOrderCreateMutationDocument,
    "DraftOrderCreateMutation",
    variables,
    token,
  );
}

export async function updateDraftOrder(id: string, input: DraftOrderInput) {
  const token = await getServerAuthToken();
  const variables: DraftOrderUpdateMutationVariables = { id, input };

  const result = await executeGraphQL(
    DraftOrderUpdateMutationDocument,
    "DraftOrderUpdateMutation",
    variables,
    token,
  );

  revalidatePath(`/orders/${id}`);

  return result;
}

export async function finalizeDraftOrder(orderId: string) {
  const token = await getServerAuthToken();
  const variables: DraftOrderCompleteMutationVariables = { id: orderId };

  const result = await executeGraphQL(
    DraftOrderCompleteMutationDocument,
    "DraftOrderCompleteMutation",
    variables,
    token,
  );

  revalidatePath(`/orders/${orderId}`);
  revalidatePath("/orders");

  return result;
}

export async function deleteDraftOrder(orderId: string) {
  const token = await getServerAuthToken();
  const variables: DraftOrderDeleteMutationVariables = { id: orderId };

  const result = await executeGraphQL(
    DraftOrderDeleteMutationDocument,
    "DraftOrderDeleteMutation",
    variables,
    token,
  );

  revalidatePath(`/orders/${orderId}`);
  revalidatePath("/orders");

  return result;
}

export async function updateOrder(id: string, input: OrderUpdateInput) {
  const token = await getServerAuthToken();
  const variables: OrderUpdateMutationVariables = { id, input };

  const result = await executeGraphQL(
    OrderUpdateMutationDocument,
    "OrderUpdateMutation",
    variables,
    token,
  );

  revalidatePath(`/orders/${id}`);

  return result;
}

export async function addOrderLines(id: string, input: OrderLineCreateInput[]) {
  const token = await getServerAuthToken();
  const variables: OrderLinesCreateMutationVariables = { id, input };

  const result = await executeGraphQL(
    OrderLinesCreateMutationDocument,
    "OrderLinesCreateMutation",
    variables,
    token,
  );

  revalidatePath(`/orders/${id}`);

  return result;
}

export async function updateOrderLine(id: string, input: OrderLineInput) {
  const token = await getServerAuthToken();
  const variables: OrderLineUpdateMutationVariables = { id, input };

  const result = await executeGraphQL(
    OrderLineUpdateMutationDocument,
    "OrderLineUpdateMutation",
    variables,
    token,
  );

  const orderId = result.ok
    ? result.data.orderLineUpdate?.order?.id
    : undefined;

  if (orderId) {
    revalidatePath(`/orders/${orderId}`);
  }

  return result;
}

export async function deleteOrderLine(id: string) {
  const token = await getServerAuthToken();
  const variables: OrderLineDeleteMutationVariables = { id };

  const result = await executeGraphQL(
    OrderLineDeleteMutationDocument,
    "OrderLineDeleteMutation",
    variables,
    token,
  );

  const orderId = result.ok
    ? result.data.orderLineDelete?.order?.id
    : undefined;

  if (orderId) {
    revalidatePath(`/orders/${orderId}`);
  }

  return result;
}

export async function addOrderDiscount(
  orderId: string,
  input: OrderDiscountCommonInput,
) {
  const token = await getServerAuthToken();
  const variables: OrderDiscountAddMutationVariables = { orderId, input };

  const result = await executeGraphQL(
    OrderDiscountAddMutationDocument,
    "OrderDiscountAddMutation",
    variables,
    token,
  );

  revalidatePath(`/orders/${orderId}`);

  return result;
}

export async function updateOrderDiscount(
  discountId: string,
  input: OrderDiscountCommonInput,
) {
  const token = await getServerAuthToken();
  const variables: OrderDiscountUpdateMutationVariables = { discountId, input };

  const result = await executeGraphQL(
    OrderDiscountUpdateMutationDocument,
    "OrderDiscountUpdateMutation",
    variables,
    token,
  );

  const orderId = result.ok
    ? result.data.orderDiscountUpdate?.order?.id
    : undefined;

  if (orderId) {
    revalidatePath(`/orders/${orderId}`);
  }

  return result;
}

export async function deleteOrderDiscount(discountId: string) {
  const token = await getServerAuthToken();
  const variables: OrderDiscountDeleteMutationVariables = { discountId };

  const result = await executeGraphQL(
    OrderDiscountDeleteMutationDocument,
    "OrderDiscountDeleteMutation",
    variables,
    token,
  );

  const orderId = result.ok
    ? result.data.orderDiscountDelete?.order?.id
    : undefined;

  if (orderId) {
    revalidatePath(`/orders/${orderId}`);
  }

  return result;
}
