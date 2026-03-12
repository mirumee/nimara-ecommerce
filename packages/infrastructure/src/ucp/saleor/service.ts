import {
  type CheckoutCreateRequest,
  type CheckoutResponse,
  type CheckoutUpdateRequest,
  type CompleteCheckoutRequestWithAp2,
} from "@ucp-js/sdk";

import { type LanguageCodeEnum } from "@nimara/codegen/schema";
import { type AsyncResult, err, ok } from "@nimara/domain/objects/Result";

import { graphqlClient } from "#root/graphql/client";

import { type UCPService } from "../types";
import {
  CheckoutSessionCreateDocument,
  CheckoutSessionItemUpdateDocument,
  UcpCheckoutCompleteMutationDocument,
  UcpCheckoutSessionUpdateDocument,
  type UcpCheckoutSessionUpdateVariables,
} from "./graphql/mutations/generated";
import { CheckoutSessionGetDocument } from "./graphql/queries/generated";
import {
  toSaleorAddress,
  validateCheckoutTermsDummy,
  verifyCheckoutMandateDummy,
  verifyMerchantAuthorizationDummy,
} from "./helpers";
import {
  sessionToCheckoutResponse,
  toPaymentHandlers,
  toUCPCheckoutSession,
  type UCPCheckoutSessionModel,
} from "./serializers";
import type {
  GraphQLMutationError,
  SaleorCheckoutLineInput,
  UCPSaleorServiceConfig,
  UCPUpdateRequestExtended,
} from "./types";

const DEFAULT_LANGUAGE_CODE = "EN" satisfies LanguageCodeEnum;

const getMutationErrors = (errors: GraphQLMutationError[] | undefined | null) =>
  errors
    ?.map((error) => error.message)
    .filter(Boolean)
    .join(", ");

export const saleorUCPService = ({
  apiUrl,
  baseUrl,
  channel,
  languageCode = DEFAULT_LANGUAGE_CODE,
}: UCPSaleorServiceConfig): UCPService => ({
  createCheckoutSession: async (
    input: CheckoutCreateRequest,
  ): AsyncResult<CheckoutResponse> => {
    const client = graphqlClient(apiUrl);

    if (!client) {
      return err([
        {
          code: "BAD_REQUEST_ERROR",
          message: "Missing Saleor API URL.",
        },
      ]);
    }

    try {
      const result = await client.execute(CheckoutSessionCreateDocument, {
        variables: {
          input: {
            channel,
            lines: input.line_items.map((line) => ({
              variantId: line.item.id,
              quantity: line.quantity,
            })),
          },
          languageCode,
        },
        operationName: "UCP:CheckoutSessionCreateMutation",
        options: {
          cache: "no-store",
        },
      });

      if (!result.ok) {
        return err(result.errors);
      }

      const checkout = result.data.checkoutCreate?.checkout;

      if (!checkout) {
        const createErrors = getMutationErrors(
          result.data.checkoutCreate?.errors,
        );

        return err([
          {
            code: "CART_CREATE_ERROR",
            message: createErrors || "Failed to create checkout session.",
          },
        ]);
      }

      const session = toUCPCheckoutSession(checkout);
      const paymentHandlers = toPaymentHandlers(checkout);

      return ok(sessionToCheckoutResponse(session, paymentHandlers));
    } catch (error) {
      return err([
        {
          code: "CART_CREATE_ERROR",
          message: "Failed to create checkout session",
        },
      ]);
    }
  },

  getCheckoutSession: async (input: {
    id: string;
  }): AsyncResult<CheckoutResponse> => {
    const client = graphqlClient(apiUrl);

    if (!client) {
      return err([
        {
          code: "BAD_REQUEST_ERROR",
          message: "Missing Saleor API URL.",
        },
      ]);
    }

    try {
      const result = await client.execute(CheckoutSessionGetDocument, {
        variables: {
          id: input.id,
          languageCode,
        },
        operationName: "UCP:CheckoutSessionGetQuery",
      });

      if (!result.ok) {
        return err(result.errors);
      }

      if (!result.data.checkout) {
        return err([
          {
            code: "CHECKOUT_NOT_FOUND_ERROR",
            message: "Checkout session not found.",
          },
        ]);
      }

      const session = toUCPCheckoutSession(result.data.checkout);
      const paymentHandlers = toPaymentHandlers(result.data.checkout);

      return ok(sessionToCheckoutResponse(session, paymentHandlers));
    } catch {
      return err([
        {
          code: "CHECKOUT_NOT_FOUND_ERROR",
          message: "Checkout session not found",
        },
      ]);
    }
  },

  updateCheckoutSession: async (
    input: CheckoutUpdateRequest,
  ): AsyncResult<CheckoutResponse> => {
    const client = graphqlClient(apiUrl);

    if (!client) {
      return err([
        {
          code: "BAD_REQUEST_ERROR",
          message: "Missing Saleor API URL.",
        },
      ]);
    }

    try {
      const existingCheckoutResult = await client.execute(
        CheckoutSessionGetDocument,
        {
          variables: {
            id: input.id,
            languageCode,
          },
          operationName: "UCP:CheckoutSessionGetQuery",
          options: {
            cache: "no-store",
          },
        },
      );

      if (!existingCheckoutResult.ok) {
        return err(existingCheckoutResult.errors);
      }

      if (!existingCheckoutResult.data.checkout) {
        return err([
          {
            code: "CHECKOUT_NOT_FOUND_ERROR",
            message: "Checkout session not found.",
          },
        ]);
      }

      const currentLinesByVariant = new Map(
        existingCheckoutResult.data.checkout.lines.map((line) => [
          line.variant.id,
          line.quantity,
        ]),
      );
      const incomingLinesByVariant = new Map(
        input.line_items.map((line) => [line.item.id, line.quantity]),
      );
      const allVariantIds = new Set([
        ...currentLinesByVariant.keys(),
        ...incomingLinesByVariant.keys(),
      ]);

      const linesToAdd: SaleorCheckoutLineInput[] = [];
      const linesToUpdate: SaleorCheckoutLineInput[] = [];

      for (const variantId of allVariantIds) {
        const currentQuantity = currentLinesByVariant.get(variantId);
        const incomingQuantity = incomingLinesByVariant.get(variantId);

        if (typeof currentQuantity === "undefined") {
          linesToAdd.push({ variantId, quantity: incomingQuantity || 0 });
          continue;
        }

        if (typeof incomingQuantity === "undefined") {
          linesToUpdate.push({ variantId, quantity: 0 });
          continue;
        }

        if (currentQuantity !== incomingQuantity) {
          linesToUpdate.push({ variantId, quantity: incomingQuantity });
        }
      }

      if (linesToAdd.length || linesToUpdate.length) {
        const itemsUpdateResult = await client.execute(
          CheckoutSessionItemUpdateDocument,
          {
            variables: {
              checkoutId: input.id,
              linesToAdd,
              shouldAddLines: linesToAdd.length > 0,
              linesToUpdate,
              shouldUpdateLines: linesToUpdate.length > 0,
            },
            operationName: "UCP:CheckoutSessionItemUpdateMutation",
            options: {
              cache: "no-store",
            },
          },
        );

        if (!itemsUpdateResult.ok) {
          return err(itemsUpdateResult.errors);
        }

        const itemMutationErrors = [
          ...(itemsUpdateResult.data.checkoutLinesAdd?.errors || []),
          ...(itemsUpdateResult.data.checkoutLinesUpdate?.errors || []),
        ]
          .map((error) => error.message)
          .filter(Boolean)
          .join(", ");

        if (itemMutationErrors) {
          return err([
            {
              code: "CART_LINES_UPDATE_ERROR",
              message: itemMutationErrors,
            },
          ]);
        }
      }

      const requestWithFulfillment = input as UCPUpdateRequestExtended;
      const destination =
        requestWithFulfillment.fulfillment?.methods?.[0]?.destinations?.[0];
      const billingAddr = requestWithFulfillment.billing_address;

      const updateVariables: UcpCheckoutSessionUpdateVariables = {
        billingAddress: toSaleorAddress(
          billingAddr || null,
          requestWithFulfillment.buyer,
        ),
        buyerEmail:
          requestWithFulfillment.buyer?.email ||
          existingCheckoutResult.data.checkout.email ||
          "unknown@example.com",
        buyerJSON: JSON.stringify(requestWithFulfillment.buyer || {}),
        checkoutId: input.id,
        fulfillmentAddressJSON: JSON.stringify(destination || {}),
        fulfillmentOptionID:
          requestWithFulfillment.fulfillment?.methods?.[0]?.groups?.[0]
            ?.selected_option_id || "",
        shouldUpdateBilling: Boolean(billingAddr),
        shouldUpdateEmail: Boolean(requestWithFulfillment.buyer?.email),
        shouldUpdateFulfillmentOption: Boolean(
          requestWithFulfillment.fulfillment?.methods?.[0]?.groups?.[0]
            ?.selected_option_id,
        ),
        shouldUpdateShipping: Boolean(destination),
        shippingAddress: toSaleorAddress(
          destination || null,
          requestWithFulfillment.buyer,
        ),
      };

      const updateResult = await client.execute(
        UcpCheckoutSessionUpdateDocument,
        {
          variables: updateVariables,
          operationName: "UCP:CheckoutSessionUpdateMutation",
          options: {
            cache: "no-store",
          },
        },
      );

      if (!updateResult.ok) {
        return err(updateResult.errors);
      }

      const updateErrors = [
        ...(updateResult.data.checkoutEmailUpdate?.errors || []),
        ...(updateResult.data.checkoutShippingAddressUpdate?.errors || []),
        ...(updateResult.data.checkoutBillingAddressUpdate?.errors || []),
        ...(updateResult.data.checkoutDeliveryMethodUpdate?.errors || []),
        ...(updateResult.data.updateMetadata?.errors || []),
      ]
        .map((error) => error.message)
        .filter(Boolean)
        .join(", ");

      if (updateErrors) {
        return err([
          {
            code: "CART_LINES_UPDATE_ERROR",
            message: updateErrors,
          },
        ]);
      }

      const refreshedCheckoutResult = await client.execute(
        CheckoutSessionGetDocument,
        {
          variables: {
            id: input.id,
            languageCode,
          },
          operationName: "UCP:CheckoutSessionGetQuery",
          options: {
            cache: "no-store",
          },
        },
      );

      if (!refreshedCheckoutResult.ok) {
        return err(refreshedCheckoutResult.errors);
      }

      if (!refreshedCheckoutResult.data.checkout) {
        return err([
          {
            code: "CHECKOUT_NOT_FOUND_ERROR",
            message: "Checkout session not found after update.",
          },
        ]);
      }

      const session = toUCPCheckoutSession(
        refreshedCheckoutResult.data.checkout,
      );
      const paymentHandlers = toPaymentHandlers(
        refreshedCheckoutResult.data.checkout,
      );

      return ok(sessionToCheckoutResponse(session, paymentHandlers));
    } catch {
      return err([
        {
          code: "CART_LINES_UPDATE_ERROR",
          message: "Failed to update checkout session",
        },
      ]);
    }
  },

  completeCheckoutSession: async (
    input: CompleteCheckoutRequestWithAp2,
  ): AsyncResult<CheckoutResponse> => {
    const client = graphqlClient(apiUrl);

    if (!client) {
      return err([
        {
          code: "BAD_REQUEST_ERROR",
          message: "Missing Saleor API URL.",
        },
      ]);
    }

    try {
      const checkoutId = (input as Record<string, unknown>).id as
        | string
        | undefined;

      if (!checkoutId) {
        return err([
          {
            code: "CHECKOUT_COMPLETE_ERROR",
            message: "Checkout id is required for completion.",
          },
        ]);
      }

      const requireAp2Mandate =
        process.env.UCP_REQUIRE_AP2_MANDATE === "true";

      if (requireAp2Mandate && !input.ap2?.checkout_mandate) {
        return err([
          {
            code: "CHECKOUT_COMPLETE_ERROR",
            message: "mandate_required",
          },
        ]);
      }

      const currentCheckoutResult = await client.execute(
        CheckoutSessionGetDocument,
        {
          variables: {
            id: checkoutId,
            languageCode,
          },
          operationName: "UCP:CheckoutSessionGetQuery",
          options: {
            cache: "no-store",
          },
        },
      );

      if (!currentCheckoutResult.ok || !currentCheckoutResult.data.checkout) {
        return err([
          {
            code: "CHECKOUT_NOT_FOUND_ERROR",
            message: "Checkout session not found.",
          },
        ]);
      }

      const currentCheckout = sessionToCheckoutResponse(
        toUCPCheckoutSession(currentCheckoutResult.data.checkout),
        toPaymentHandlers(currentCheckoutResult.data.checkout),
      );

      if (requireAp2Mandate && input.ap2?.checkout_mandate) {
        const authVerification =
          verifyMerchantAuthorizationDummy(currentCheckout);

        if (!authVerification.valid) {
          return err([
            {
              code: "CHECKOUT_COMPLETE_ERROR",
              message: "merchant_authorization_invalid",
            },
          ]);
        }

        const mandateVerification = verifyCheckoutMandateDummy(
          input.ap2.checkout_mandate,
          currentCheckout,
        );

        if (!mandateVerification.valid) {
          return err([
            {
              code: "CHECKOUT_COMPLETE_ERROR",
              message: "mandate_invalid_signature",
            },
          ]);
        }

        const termsValidation = validateCheckoutTermsDummy(
          currentCheckout,
          mandateVerification.checkout || currentCheckout,
        );

        if (!termsValidation.valid) {
          return err([
            {
              code: "CHECKOUT_COMPLETE_ERROR",
              message: "mandate_scope_mismatch",
            },
          ]);
        }
      }

      const result = await client.execute(UcpCheckoutCompleteMutationDocument, {
        variables: { id: checkoutId },
        operationName: "UCP:CheckoutCompleteMutation",
        options: {
          cache: "no-store",
        },
      });

      if (!result.ok) {
        return err(result.errors);
      }

      const completionErrors = getMutationErrors(
        result.data.checkoutComplete?.errors,
      );

      if (completionErrors) {
        return err([
          {
            code: "CHECKOUT_COMPLETE_ERROR",
            message: completionErrors,
          },
        ]);
      }

      const order = result.data.checkoutComplete?.order;

      if (!order) {
        return err([
          {
            code: "CHECKOUT_COMPLETE_ERROR",
            message: "No order returned after checkout completion.",
          },
        ]);
      }

      const checkoutResult = await client.execute(CheckoutSessionGetDocument, {
        variables: {
          id: checkoutId,
          languageCode,
        },
        operationName: "UCP:CheckoutSessionGetQuery",
        options: {
          cache: "no-store",
        },
      });

      if (!checkoutResult.ok || !checkoutResult.data.checkout) {
        const fallbackSession: UCPCheckoutSessionModel = {
          id: checkoutId,
          status: "completed",
          currency: "USD",
          fulfillment: {},
          lineItems: [],
          totals: [{ type: "total", amount: 0 }],
          order: {
            id: order.id,
            permalinkUrl: `${baseUrl}/orders/${order.id}`,
          },
        };

        return ok(sessionToCheckoutResponse(fallbackSession));
      }

      const paymentHandlers = toPaymentHandlers(checkoutResult.data.checkout);
      const completedSession: UCPCheckoutSessionModel = {
        ...toUCPCheckoutSession(checkoutResult.data.checkout),
        status: "completed",
        order: {
          id: order.id,
          permalinkUrl: `${baseUrl}/orders/${order.id}`,
        },
      };

      return ok(sessionToCheckoutResponse(completedSession, paymentHandlers));
    } catch {
      return err([
        {
          code: "CHECKOUT_COMPLETE_ERROR",
          message: "Failed to complete checkout session",
        },
      ]);
    }
  },

  cancelCheckout: async (_input: {
    id: string;
  }): AsyncResult<CheckoutResponse> => {
    return err([
      {
        code: "BAD_REQUEST_ERROR",
        message: "Checkout cancellation is not supported by Saleor.",
      },
    ]);
  },
});
