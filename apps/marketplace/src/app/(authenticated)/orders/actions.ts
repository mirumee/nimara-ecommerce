"use server";

import { revalidatePath } from "next/cache";

import {
  ChannelShippingMethodsPerCountryDocument,
  type ChannelShippingMethodsPerCountryVariables,
  type CountryCode,
  CustomerByEmailDocument,
  type CustomerByEmailVariables,
  DraftOrderCompleteDocument,
  type DraftOrderCompleteVariables,
  DraftOrderCreateDocument,
  type DraftOrderCreateInput,
  type DraftOrderCreateVariables,
  type DraftOrderInput,
  DraftOrderUpdateDocument,
  type DraftOrderUpdateVariables,
  OrderDiscountAddDocument,
  type OrderDiscountAddVariables,
  type OrderDiscountCommonInput,
  OrderDiscountDeleteDocument,
  type OrderDiscountDeleteVariables,
  OrderDiscountUpdateDocument,
  type OrderDiscountUpdateVariables,
  type OrderLineCreateInput,
  OrderLineDeleteDocument,
  type OrderLineDeleteVariables,
  type OrderLineInput,
  OrderLinesCreateDocument,
  type OrderLinesCreateVariables,
  OrderLineUpdateDocument,
  type OrderLineUpdateVariables,
  OrderUpdateDocument,
  type OrderUpdateInput,
  type OrderUpdateVariables,
  type ProductDetailVariables,
  type ProductsVariables,
} from "@/graphql/generated/client";
import { getServerAuthToken } from "@/lib/auth/server";
import { executeGraphQL } from "@/lib/graphql/execute";
import { productsService } from "@/services";

export async function searchCustomers(search: string) {
  const token = await getServerAuthToken();
  const variables: CustomerByEmailVariables = { search };

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
  const variables: DraftOrderCreateVariables = { input };

  return executeGraphQL(
    DraftOrderCreateDocument,
    "DraftOrderCreateMutation",
    variables,
    token,
  );
}

export async function updateDraftOrder(id: string, input: DraftOrderInput) {
  const token = await getServerAuthToken();
  const variables: DraftOrderUpdateVariables = { id, input };

  const result = await executeGraphQL(
    DraftOrderUpdateDocument,
    "DraftOrderUpdateMutation",
    variables,
    token,
  );

  revalidatePath(`/orders/${id}`);

  return result;
}

export async function finalizeDraftOrder(orderId: string) {
  const token = await getServerAuthToken();
  const variables: DraftOrderCompleteVariables = { id: orderId };

  const result = await executeGraphQL(
    DraftOrderCompleteDocument,
    "DraftOrderCompleteMutation",
    variables,
    token,
  );

  revalidatePath(`/orders/${orderId}`);
  revalidatePath("/orders");

  return result;
}

export async function updateOrder(id: string, input: OrderUpdateInput) {
  const token = await getServerAuthToken();
  const variables: OrderUpdateVariables = { id, input };

  const result = await executeGraphQL(
    OrderUpdateDocument,
    "OrderUpdateMutation",
    variables,
    token,
  );

  revalidatePath(`/orders/${id}`);

  return result;
}

export async function addOrderLines(id: string, input: OrderLineCreateInput[]) {
  const token = await getServerAuthToken();
  const variables: OrderLinesCreateVariables = { id, input };

  const result = await executeGraphQL(
    OrderLinesCreateDocument,
    "OrderLinesCreateMutation",
    variables,
    token,
  );

  revalidatePath(`/orders/${id}`);

  return result;
}

export async function updateOrderLine(id: string, input: OrderLineInput) {
  const token = await getServerAuthToken();
  const variables: OrderLineUpdateVariables = { id, input };

  const result = await executeGraphQL(
    OrderLineUpdateDocument,
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
  const variables: OrderLineDeleteVariables = { id };

  const result = await executeGraphQL(
    OrderLineDeleteDocument,
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
  const variables: OrderDiscountAddVariables = { orderId, input };

  const result = await executeGraphQL(
    OrderDiscountAddDocument,
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
  const variables: OrderDiscountUpdateVariables = { discountId, input };

  const result = await executeGraphQL(
    OrderDiscountUpdateDocument,
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
  const variables: OrderDiscountDeleteVariables = { discountId };

  const result = await executeGraphQL(
    OrderDiscountDeleteDocument,
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
