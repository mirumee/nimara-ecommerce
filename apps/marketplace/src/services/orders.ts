import type { DocumentTypeDecoration } from "@graphql-typed-document-node/core";

import type { AsyncResult } from "@nimara/domain/objects/Result";

import {
  type Order_Query,
  type OrderCancel,
  OrderCancelDocument,
  type OrderCancelVariables,
  OrderDocument,
  type OrderFulfill_Mutation,
  OrderFulfillDocument,
  type OrderFulfillmentCancel_Mutation,
  OrderFulfillmentCancelDocument,
  type OrderFulfillmentCancelVariables,
  type OrderFulfillVariables,
  type OrderNoteAdd,
  OrderNoteAddDocument,
  type OrderNoteAddVariables,
  type Orders,
  OrdersDocument,
  type OrdersVariables,
  type OrderVariables,
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
    variables?: OrdersVariables,
    token?: string | null,
  ): AsyncResult<Orders> {
    return executeGraphQL(OrdersDocument, "OrdersQuery", variables, token);
  }

  async getOrder(
    variables: OrderVariables,
    token?: string | null,
  ): AsyncResult<Order_Query> {
    return executeGraphQL(
      OrderDocument,
      "OrderQuery",
      variables,
      token,
    ) as AsyncResult<Order_Query>;
  }

  async fulfillOrder(
    variables: OrderFulfillVariables,
    token?: string | null,
  ): AsyncResult<OrderFulfill_Mutation> {
    return executeGraphQL<
      OrderFulfill_Mutation,
      OrderFulfillVariables
    >(
      OrderFulfillDocument as DocumentTypeDecoration<
        OrderFulfill_Mutation,
        OrderFulfillVariables
      > &
        DocumentWithToString,
      "OrderFulfillMutation",
      variables,
      token,
    );
  }

  async cancelFulfillment(
    variables: OrderFulfillmentCancelVariables,
    token?: string | null,
  ): AsyncResult<OrderFulfillmentCancel_Mutation> {
    return executeGraphQL<
      OrderFulfillmentCancel_Mutation,
      OrderFulfillmentCancelVariables
    >(
      OrderFulfillmentCancelDocument as DocumentTypeDecoration<
        OrderFulfillmentCancel_Mutation,
        OrderFulfillmentCancelVariables
      > &
        DocumentWithToString,
      "OrderFulfillmentCancelMutation",
      variables,
      token,
    );
  }

  async cancelOrder(
    variables: OrderCancelVariables,
    token?: string | null,
  ): AsyncResult<OrderCancel> {
    return executeGraphQL(
      OrderCancelDocument,
      "OrderCancelMutation",
      variables,
      token,
    );
  }

  async addOrderNote(
    variables: OrderNoteAddVariables,
    token?: string | null,
  ): AsyncResult<OrderNoteAdd> {
    return executeGraphQL(
      OrderNoteAddDocument,
      "OrderNoteAddMutation",
      variables,
      token,
    );
  }
}

export const ordersService = new OrdersService();
