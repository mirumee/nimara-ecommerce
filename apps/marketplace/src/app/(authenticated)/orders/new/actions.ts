"use server";

// eslint-disable-next-line simple-import-sort/imports
import {
  AddOrderNoteDocument,
  ChannelShippingMethodsPerCountryDocument,
  CustomerByEmailDocument,
  DraftOrderCompleteMutationDocument,
  DraftOrderCreateMutationDocument,
  DraftOrderDeleteMutationDocument,
  type AddOrderNoteVariables,
  type ChannelShippingMethodsPerCountryVariables,
  type CountryCode,
  type CustomerByEmailVariables,
  type DraftOrderCompleteMutationVariables,
  type DraftOrderCreateInput,
  type DraftOrderCreateMutationVariables,
  type DraftOrderDeleteMutationVariables,
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

export async function completeDraftOrder(orderId: string) {
  const token = await getServerAuthToken();
  const variables: DraftOrderCompleteMutationVariables = { id: orderId };

  return executeGraphQL(
    DraftOrderCompleteMutationDocument,
    "DraftOrderCompleteMutation",
    variables,
    token,
  );
}

export async function deleteDraftOrder(orderId: string) {
  const token = await getServerAuthToken();
  const variables: DraftOrderDeleteMutationVariables = { id: orderId };

  return executeGraphQL(
    DraftOrderDeleteMutationDocument,
    "DraftOrderDeleteMutation",
    variables,
    token,
  );
}

export async function addInternalOrderNote(orderId: string, message: string) {
  const token = await getServerAuthToken();
  const variables: AddOrderNoteVariables = {
    order: orderId,
    input: { message },
  };

  return executeGraphQL(
    AddOrderNoteDocument,
    "AddOrderNoteMutation",
    variables,
    token,
  );
}
