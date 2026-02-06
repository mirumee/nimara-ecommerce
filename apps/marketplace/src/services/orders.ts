import type { DocumentTypeDecoration } from "@graphql-typed-document-node/core";

import type { AsyncResult } from "@nimara/domain/objects/Result";

import {
  type AddOrderNote,
  AddOrderNoteDocument,
  type AddOrderNoteVariables,
  type CancelOrder,
  CancelOrderDocument,
  type CancelOrderVariables,
  type CancelOrderFulfillment,
  CancelOrderFulfillmentDocument,
  type CancelOrderFulfillmentVariables,
  type FulfillOrder,
  FulfillOrderDocument,
  type FulfillOrderVariables,
  type OrderDetail,
  OrderDetailDocument,
  type OrderDetailVariables,
  type OrdersList,
  OrdersListDocument,
  type OrdersListVariables,
} from "@/graphql/generated/client";
import { executeGraphQL } from "@/lib/graphql/execute";

type DocumentWithToString = DocumentTypeDecoration<unknown, unknown> & {
  toString(): string;
};

/**
 * Service for marketplace order management operations.
 * Handles order queries, fulfillment, cancellation, and note management.
 */
class OrdersService {
  async getOrders(
    variables?: OrdersListVariables,
    token?: string | null,
  ): AsyncResult<OrdersList> {
    return executeGraphQL(OrdersListDocument, "OrdersListQuery", variables, token);
  }

  async getOrder(
    variables: OrderDetailVariables,
    token?: string | null,
  ): AsyncResult<OrderDetail> {
    return executeGraphQL(
      OrderDetailDocument,
      "OrderDetailQuery",
      variables,
      token,
    );
  }

  async fulfillOrder(
    variables: FulfillOrderVariables,
    token?: string | null,
  ): AsyncResult<FulfillOrder> {
    return executeGraphQL<
      FulfillOrder,
      FulfillOrderVariables
    >(
      FulfillOrderDocument as DocumentTypeDecoration<
        FulfillOrder,
        FulfillOrderVariables
      > &
        DocumentWithToString,
      "FulfillOrderMutation",
      variables,
      token,
    );
  }

  async cancelFulfillment(
    variables: CancelOrderFulfillmentVariables,
    token?: string | null,
  ): AsyncResult<CancelOrderFulfillment> {
    return executeGraphQL<
      CancelOrderFulfillment,
      CancelOrderFulfillmentVariables
    >(
      CancelOrderFulfillmentDocument as DocumentTypeDecoration<
        CancelOrderFulfillment,
        CancelOrderFulfillmentVariables
      > &
        DocumentWithToString,
      "CancelOrderFulfillmentMutation",
      variables,
      token,
    );
  }

  async cancelOrder(
    variables: CancelOrderVariables,
    token?: string | null,
  ): AsyncResult<CancelOrder> {
    return executeGraphQL(
      CancelOrderDocument,
      "CancelOrderMutation",
      variables,
      token,
    );
  }

  async addOrderNote(
    variables: AddOrderNoteVariables,
    token?: string | null,
  ): AsyncResult<AddOrderNote> {
    return executeGraphQL(
      AddOrderNoteDocument,
      "AddOrderNoteMutation",
      variables,
      token,
    );
  }
}

export const ordersService = new OrdersService();
