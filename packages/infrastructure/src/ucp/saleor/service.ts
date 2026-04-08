import {
  type CheckoutCreateRequest,
  type CheckoutResponse,
  type CheckoutUpdateRequest,
  type CheckoutWithBuyerConsentCreateRequest,
  type CheckoutWithDiscountCreateRequest,
  type CheckoutWithDiscountUpdateRequest,
  type CompleteCheckoutRequestWithAp2,
  type Order as UcpOrder,
} from "@ucp-js/sdk";

import { type LanguageCodeEnum } from "@nimara/codegen/schema";
import { err, ok } from "@nimara/domain/objects/Result";
import type { NonEmptyArray } from "@nimara/domain/objects/types";

import { graphqlClient } from "#root/graphql/client";
import { getDiscoveryProfile } from "#root/ucp/profile";

import {
  type UCPResponse,
  type UCPService,
  type UCPServiceError,
} from "../types";
import { mapSaleorErrorToUCP } from "./error-mapping";
import {
  UcpCheckoutAddPromoCodeDocument,
  UcpCheckoutCompleteMutationDocument,
  UcpCheckoutRemovePromoCodeDocument,
  UcpCheckoutSessionCreateDocument,
  UcpCheckoutSessionItemUpdateDocument,
  UcpCheckoutSessionUpdateDocument,
  type UcpCheckoutSessionUpdateVariables,
} from "./graphql/mutations/generated";
import {
  UcpCheckoutSessionGetDocument,
  UcpOrderGetDocument,
} from "./graphql/queries/generated";
import {
  calculateCheckoutExpiration,
  generateContinueUrl,
  lineItemsFromSaleorCheckoutLines,
  toSaleorAddress,
  validateCheckoutTermsDummy,
  verifyCheckoutMandateDummy,
  verifyMerchantAuthorizationDummy,
} from "./helpers";
import {
  orderToUCPOrder,
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

type CheckoutCreateInput =
  | CheckoutWithBuyerConsentCreateRequest
  | CheckoutCreateRequest
  | CheckoutWithDiscountCreateRequest;
/**
 * Maps Saleor GraphQL mutation errors to domain-compliant error objects.
 * Each error is mapped using the UCP error mapping to provide proper severity
 * and error codes that platforms can understand.
 *
 * @param saleorErrors - Array of Saleor GraphQL errors
 * @returns Array of domain BaseError objects with context for UCP error mapping
 */
const mapSaleorMutationErrors = (
  saleorErrors: GraphQLMutationError[] | undefined | null,
): NonEmptyArray<UCPServiceError> => {
  if (!saleorErrors || saleorErrors.length === 0) {
    return [
      {
        code: "CHECKOUT_COMPLETE_ERROR" as const,
        message: "Unknown checkout error occurred.",
      },
    ];
  }

  const toUcpServiceError = (error: GraphQLMutationError): UCPServiceError => {
    // Extract Saleor error code if available
    const saleorCode = error.code ?? error.message?.split(":")[0] ?? "INVALID";

    // Map to UCP error for reference (phase 2 will use this in messages array)
    const ucpMapping = mapSaleorErrorToUCP(
      String(saleorCode),
      error.message || "",
    );

    // Use appropriate domain error code based on severity
    let domainErrorCode:
      | "CHECKOUT_COMPLETE_ERROR"
      | "CART_LINES_UPDATE_ERROR"
      | "CART_CREATE_ERROR" = "CHECKOUT_COMPLETE_ERROR";

    if (
      ucpMapping.severity === "recoverable" &&
      ucpMapping.code === "out_of_stock"
    ) {
      domainErrorCode = "CART_LINES_UPDATE_ERROR";
    }

    return {
      code: domainErrorCode,
      message: error.message || "Checkout operation failed",
      context: {
        saleorCode,
        ucpCode: ucpMapping.code,
        severity: ucpMapping.severity,
      },
    };
  };

  const [firstError, ...restErrors] = saleorErrors;
  const fallbackFirstError: GraphQLMutationError = {
    code: "INVALID",
    message: "Unknown checkout error occurred.",
  };

  return [
    toUcpServiceError(firstError ?? fallbackFirstError),
    ...restErrors.map(toUcpServiceError),
  ];
};

const toNonEmptyErrors = (
  errors: UCPServiceError[],
): NonEmptyArray<UCPServiceError> | null => {
  const [firstError, ...restErrors] = errors;

  if (!firstError) {
    return null;
  }

  return [firstError, ...restErrors];
};

type GraphQLClient = NonNullable<ReturnType<typeof graphqlClient>>;

/**
 * Synchronises Saleor voucher state with the requested discount codes.
 *
 * Rules (per Saleor API: only one voucher code is active at a time):
 * - If a code is provided and differs from the current one → add the new code.
 * - If codes array is empty/undefined and a voucher is currently applied → remove it.
 * - If the same code is already applied → no-op.
 *
 * Per UCP spec, unknown/invalid discount codes are silently ignored: the
 * operation succeeds and no discount is applied. Only transport-level failures
 * (network errors, unexpected GraphQL errors) are returned as errors.
 *
 * Returns an error array on transport failure, or an empty array otherwise.
 */
const applyCheckoutDiscounts = async (
  client: GraphQLClient,
  checkoutId: string,
  requestedCodes: string[] | undefined,
  currentVoucherCode: string | null | undefined,
): Promise<UCPServiceError[]> => {
  const newCode = requestedCodes?.[0];

  if (newCode) {
    if (newCode === currentVoucherCode) {
      return [];
    }
    const result = await client.execute(UcpCheckoutAddPromoCodeDocument, {
      variables: { checkoutId, promoCode: newCode },
      operationName: "UCP:CheckoutAddPromoCodeMutation",
      options: { cache: "no-store" },
    });

    if (!result.ok) {
      return result.errors.map((e) => ({
        code: "INVALID_VALUE_ERROR",
        message: e.message ?? "Failed to apply discount code.",
      }));
    }

    // Saleor mutation errors (e.g. unknown/expired code) are silently ignored
    // per UCP spec: unknown codes must not fail the request.
    return [];
  }

  if (!newCode && currentVoucherCode) {
    const result = await client.execute(UcpCheckoutRemovePromoCodeDocument, {
      variables: { checkoutId, promoCode: currentVoucherCode },
      operationName: "UCP:CheckoutRemovePromoCodeMutation",
      options: { cache: "no-store" },
    });

    if (!result.ok) {
      return result.errors.map((e) => ({
        code: "INVALID_VALUE_ERROR",
        message: e.message ?? "Failed to remove discount code.",
      }));
    }

    // Saleor mutation errors for removal are also silently ignored.
    return [];
  }

  return [];
};

export const saleorUCPService = ({
  apiUrl,
  storefrontURL,
  channelPrefix,
  channel,
  defaultEmail,
  version,
  capabilities = [],
  languageCode = DEFAULT_LANGUAGE_CODE,
  requireAp2Mandate = false,
}: UCPSaleorServiceConfig): UCPService => ({
  createCheckoutSession: async (
    input: CheckoutCreateInput,
  ): UCPResponse<CheckoutResponse> => {
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
      const metadata = [];

      if (input.buyer) {
        const buyerConsent =
          input.buyer as CheckoutWithBuyerConsentCreateRequest["buyer"];

        metadata.push({
          key: "ucp.buyer.json",
          value: JSON.stringify(buyerConsent ?? {}),
        });
      }

      const result = await client.execute(UcpCheckoutSessionCreateDocument, {
        variables: {
          input: {
            email: input.buyer?.email ?? defaultEmail,
            channel,
            lines: input.line_items.map((line) => ({
              variantId: line.item.id,
              quantity: line.quantity,
            })),
            metadata,
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
        const saleorErrors = result.data.checkoutCreate?.errors;
        const errors = mapSaleorMutationErrors(saleorErrors);

        return err(errors);
      }

      const continueURL = generateContinueUrl({
        checkoutId: checkout.id,
        storefrontURL,
        channelPrefix,
      });

      const discountInput = (input as CheckoutWithDiscountCreateRequest)
        .discounts;
      const discountErrors = await applyCheckoutDiscounts(
        client,
        checkout.id,
        discountInput?.codes,
        null,
      );

      // Transport-level failures from discount application are still fatal.
      // Saleor-level errors (unknown/expired codes) are already silently
      // ignored inside applyCheckoutDiscounts per UCP spec.
      const nonEmptyDiscountErrors = toNonEmptyErrors(discountErrors);

      if (nonEmptyDiscountErrors) {
        return err(nonEmptyDiscountErrors);
      }

      // Re-fetch to reflect any applied discount in the response
      if (discountInput?.codes?.length) {
        const refreshed = await client.execute(UcpCheckoutSessionGetDocument, {
          variables: { id: checkout.id, languageCode },
          operationName: "UCP:CheckoutSessionGetQuery",
          options: { cache: "no-store" },
        });

        if (refreshed.ok && refreshed.data.checkout) {
          const session = toUCPCheckoutSession({
            checkout: refreshed.data.checkout,
            continueURL,
            storefrontURL,
          });

          return ok(
            sessionToCheckoutResponse({
              version,
              session,
              capabilities,
              paymentHandlers: toPaymentHandlers({
                version,
                checkout: refreshed.data.checkout,
              }),
            }),
          );
        }
      }

      const session = toUCPCheckoutSession({
        checkout,
        continueURL,
        storefrontURL,
        order: undefined,
      });
      const paymentHandlers = toPaymentHandlers({
        version,
        checkout,
      });

      return ok(
        sessionToCheckoutResponse({
          version,
          session,
          capabilities,
          paymentHandlers,
        }),
      );
    } catch (error) {
      return err([
        {
          code: "CART_CREATE_ERROR",
          message: "Failed to create checkout session",
        },
      ]);
    }
  },

  discoveryProfile: () => getDiscoveryProfile(),

  getCheckoutSession: async (input: {
    id: string;
  }): UCPResponse<CheckoutResponse> => {
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
      const result = await client.execute(UcpCheckoutSessionGetDocument, {
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

      const continueURL = generateContinueUrl({
        checkoutId: result.data.checkout.id,
        storefrontURL,
        channelPrefix,
      });

      const session = toUCPCheckoutSession({
        checkout: result.data.checkout,
        continueURL,
        storefrontURL,
        order: undefined,
      });
      const paymentHandlers = toPaymentHandlers({
        version,
        checkout: result.data.checkout,
      });

      return ok(
        sessionToCheckoutResponse({
          version,
          session,
          capabilities,
          paymentHandlers,
        }),
      );
    } catch {
      return err([
        {
          code: "CHECKOUT_NOT_FOUND_ERROR",
          message: "Checkout session not found",
        },
      ]);
    }
  },

  getOrder: async (input: { id: string }): UCPResponse<UcpOrder> => {
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
      const result = await client.execute(UcpOrderGetDocument, {
        variables: {
          id: input.id,
        },
        operationName: "UCP:OrderGetQuery",
      });

      if (!result.ok) {
        return err(result.errors);
      }

      if (!result.data.order) {
        return err([
          {
            code: "NOT_FOUND_ERROR",
            message: "Order not found.",
          },
        ]);
      }

      const order = orderToUCPOrder({
        order: result.data.order,
        storefrontURL,
        capabilities,
      });

      return ok(order);
    } catch (error) {
      return err([
        {
          code: "NOT_AVAILABLE_ERROR",
          message: "Failed to get order",
        },
      ]);
    }
  },
  updateCheckoutSession: async (
    input: CheckoutUpdateRequest | CheckoutWithDiscountUpdateRequest,
  ): UCPResponse<CheckoutResponse> => {
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
        UcpCheckoutSessionGetDocument,
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

      const checkoutEntity = existingCheckoutResult.data.checkout;
      const incomingLineItems =
        input.line_items ??
        lineItemsFromSaleorCheckoutLines(checkoutEntity.lines);

      const currentLinesByVariant = new Map<string, number>(
        checkoutEntity.lines.map((line) => [line.variant.id, line.quantity]),
      );
      const incomingLinesByVariant = new Map<string, number>(
        incomingLineItems.map((line) => [line.item.id, line.quantity]),
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
          UcpCheckoutSessionItemUpdateDocument,
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

        const itemUpdateErrors = [
          ...(itemsUpdateResult.data.checkoutLinesAdd?.errors || []),
          ...(itemsUpdateResult.data.checkoutLinesUpdate?.errors || []),
        ];

        if (itemUpdateErrors.length > 0) {
          const errors = mapSaleorMutationErrors(itemUpdateErrors);

          return err(errors);
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
          "not-provided@example.com",
        buyerJSON: JSON.stringify(requestWithFulfillment.buyer || {}),
        checkoutId: input.id,
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

      const allUpdateErrors = [
        ...(updateResult.data.checkoutEmailUpdate?.errors || []),
        ...(updateResult.data.checkoutShippingAddressUpdate?.errors || []),
        ...(updateResult.data.checkoutBillingAddressUpdate?.errors || []),
        ...(updateResult.data.checkoutDeliveryMethodUpdate?.errors || []),
        ...(updateResult.data.updateMetadata?.errors || []),
      ];

      if (allUpdateErrors.length > 0) {
        const errors = mapSaleorMutationErrors(allUpdateErrors);

        return err(errors);
      }

      const discountInput = (input as CheckoutWithDiscountUpdateRequest)
        .discounts;

      // discounts field present in request means caller wants to manage vouchers
      if (discountInput !== undefined) {
        const currentVoucherCode =
          existingCheckoutResult.data.checkout.voucherCode;
        const discountErrors = await applyCheckoutDiscounts(
          client,
          input.id,
          discountInput.codes,
          currentVoucherCode,
        );

        const nonEmptyDiscountErrors = toNonEmptyErrors(discountErrors);

        if (nonEmptyDiscountErrors) {
          return err(nonEmptyDiscountErrors);
        }
      }

      const refreshedCheckoutResult = await client.execute(
        UcpCheckoutSessionGetDocument,
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

      const continueURL = generateContinueUrl({
        checkoutId: refreshedCheckoutResult.data.checkout.id,
        storefrontURL,
        channelPrefix,
      });

      const session = toUCPCheckoutSession({
        checkout: refreshedCheckoutResult.data.checkout,
        continueURL,
        storefrontURL,
        order: undefined,
      });
      const paymentHandlers = toPaymentHandlers({
        version,
        checkout: refreshedCheckoutResult.data.checkout,
      });

      return ok(
        sessionToCheckoutResponse({
          version,
          session,
          capabilities,
          paymentHandlers,
        }),
      );
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
  ): UCPResponse<CheckoutResponse> => {
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

      if (requireAp2Mandate && !input.ap2?.checkout_mandate) {
        return err([
          {
            code: "CHECKOUT_COMPLETE_ERROR",
            message: "mandate_required",
          },
        ]);
      }

      const currentCheckoutResult = await client.execute(
        UcpCheckoutSessionGetDocument,
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

      const continueURL = generateContinueUrl({
        checkoutId: currentCheckoutResult.data.checkout.id,
        storefrontURL,
        channelPrefix,
      });

      const currentCheckout = sessionToCheckoutResponse({
        version,
        session: toUCPCheckoutSession({
          checkout: currentCheckoutResult.data.checkout,
          continueURL,
          storefrontURL,
          order: undefined,
        }),
        capabilities,
        paymentHandlers: toPaymentHandlers({
          version,
          checkout: currentCheckoutResult.data.checkout,
        }),
      });

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

      const completeErrors = result.data.checkoutComplete?.errors;

      if (completeErrors && completeErrors.length > 0) {
        const errors = mapSaleorMutationErrors(completeErrors);

        return err(errors);
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

      const checkoutResult = await client.execute(
        UcpCheckoutSessionGetDocument,
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

      if (!checkoutResult.ok || !checkoutResult.data?.checkout) {
        const fallbackSession: UCPCheckoutSessionModel = {
          id: checkoutId,
          status: "completed",
          currency: "USD",
          fulfillment: {},
          lineItems: [],
          totals: [{ type: "total", amount: 0 }],
          links: [],
          expiresAtISO: calculateCheckoutExpiration(),
          order: {
            id: order.id,
            permalinkUrl: new URL(
              `/orders/${order.id}`,
              storefrontURL,
            ).toString(),
          },
        };

        return ok(
          sessionToCheckoutResponse({
            version,
            session: fallbackSession,
            capabilities,
            paymentHandlers: toPaymentHandlers({
              version,
              checkout: checkoutResult.data?.checkout ?? {
                availablePaymentGateways: [],
              },
            }),
          }),
        );
      }

      const paymentHandlers = toPaymentHandlers({
        version,
        checkout: checkoutResult.data.checkout,
      });
      const completedSession: UCPCheckoutSessionModel = {
        ...toUCPCheckoutSession({
          checkout: checkoutResult.data.checkout,
          continueURL,
          storefrontURL,
          order: undefined,
        }),
        status: "completed",
        order: {
          id: order.id,
          permalinkUrl: new URL(
            `/orders/${order.id}`,
            storefrontURL,
          ).toString(),
        },
      };

      return ok(
        sessionToCheckoutResponse({
          version,
          session: completedSession,
          capabilities,
          paymentHandlers,
        }),
      );
    } catch {
      return err([
        {
          code: "CHECKOUT_COMPLETE_ERROR",
          message: "Failed to complete checkout session",
        },
      ]);
    }
  },

  /**
   * Cancels a checkout session per UCP by removing all cart lines.
   *
   * Saleor has no dedicated “cancel checkout” mutation; empty checkouts expire
   * sooner (e.g. 6h) than non-empty ones. See:
   * https://docs.saleor.io/developer/checkout/lifecycle#checkout-expiration-and-deletion
   *
   * Completed checkouts (e.g. payment authorized / order placed) cannot be canceled.
   */
  cancelCheckout: async (input: {
    id: string;
  }): UCPResponse<CheckoutResponse> => {
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
      const existingResult = await client.execute(
        UcpCheckoutSessionGetDocument,
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

      if (!existingResult.ok) {
        return err(existingResult.errors);
      }

      const checkout = existingResult.data.checkout;

      if (!checkout) {
        return err([
          {
            code: "CHECKOUT_NOT_FOUND_ERROR",
            message: "Checkout session not found.",
          },
        ]);
      }

      if (checkout.authorizeStatus === "FULL") {
        return err([
          {
            code: "CHECKOUT_COMPLETE_ERROR",
            message:
              "Checkout cannot be canceled because it is already completed or fully authorized.",
          },
        ]);
      }

      const buildCanceledResponse = () => {
        const refreshed = existingResult.data.checkout!;

        const continueURL = generateContinueUrl({
          checkoutId: refreshed.id,
          storefrontURL,
          channelPrefix,
        });

        const session = toUCPCheckoutSession({
          checkout: refreshed,
          continueURL,
          storefrontURL,
          order: undefined,
        });

        return ok(
          sessionToCheckoutResponse({
            version,
            session: { ...session, status: "canceled" },
            capabilities,
            paymentHandlers: toPaymentHandlers({
              version,
              checkout: refreshed,
            }),
          }),
        );
      };

      if (checkout.lines.length === 0) {
        return buildCanceledResponse();
      }

      const linesToUpdate: SaleorCheckoutLineInput[] = checkout.lines.map(
        (line) => ({
          variantId: line.variant.id,
          quantity: 0,
        }),
      );

      const itemsUpdateResult = await client.execute(
        UcpCheckoutSessionItemUpdateDocument,
        {
          variables: {
            checkoutId: input.id,
            linesToAdd: [],
            shouldAddLines: false,
            linesToUpdate,
            shouldUpdateLines: true,
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

      const itemUpdateErrors = [
        ...(itemsUpdateResult.data.checkoutLinesUpdate?.errors || []),
      ];

      if (itemUpdateErrors.length > 0) {
        const errors = mapSaleorMutationErrors(itemUpdateErrors);

        return err(errors);
      }

      const refreshedResult = await client.execute(
        UcpCheckoutSessionGetDocument,
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

      if (!refreshedResult.ok || !refreshedResult.data.checkout) {
        return err([
          {
            code: "CHECKOUT_NOT_FOUND_ERROR",
            message: "Checkout session not found after cancel.",
          },
        ]);
      }

      const continueURL = generateContinueUrl({
        checkoutId: refreshedResult.data.checkout.id,
        storefrontURL,
        channelPrefix,
      });

      const session = toUCPCheckoutSession({
        checkout: refreshedResult.data.checkout,
        continueURL,
        storefrontURL,
        order: undefined,
      });

      return ok(
        sessionToCheckoutResponse({
          version,
          session: { ...session, status: "canceled" },
          capabilities,
          paymentHandlers: toPaymentHandlers({
            version,
            checkout: refreshedResult.data.checkout,
          }),
        }),
      );
    } catch {
      return err([
        {
          code: "CHECKOUT_COMPLETE_ERROR",
          message: "Failed to cancel checkout session",
        },
      ]);
    }
  },
});
