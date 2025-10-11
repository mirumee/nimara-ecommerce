import { type AllCountryCode } from "@nimara/domain/consts";

import { type GraphqlClient } from "#root/graphql/client";
import { logger } from "#root/logging/service";
import { type Logger } from "#root/logging/types";
import {
  CheckoutSessionUpdateDocument,
  CheckoutSessionUpdateVariables,
} from "#root/mcp/saleor/graphql/mutations/generated";
import { CheckoutSessionGetDocument } from "#root/mcp/saleor/graphql/queries/generated";
import { validateAndSerializeCheckout } from "#root/mcp/saleor/serializers";
import { type CheckoutSessionUpdateInput } from "#root/mcp/schema";
import { ACPResponse } from "#root/mcp/types";

const DEFAULT_CACHE_TIME = 60 * 60; // 1 hour
const DEFAULT_LANGUAGE = "EN";

export const checkoutSessionUpdateInfra = async ({
  deps,
  input,
}: {
  deps: {
    graphqlClient: GraphqlClient;
    logger: Logger;
    storefrontUrl: string;
  };
  input: { checkoutSessionId: string; data: CheckoutSessionUpdateInput };
}): ACPResponse => {
  const { checkoutSessionId, data } = input;
  const { buyer, fulfillment_address, items, fulfillment_option_id } = data;

  const resultCheckoutSessionGet = await deps.graphqlClient.execute(
    CheckoutSessionGetDocument,
    {
      variables: {
        id: checkoutSessionId,
        languageCode: DEFAULT_LANGUAGE,
      },
      options: {
        next: {
          revalidate: DEFAULT_CACHE_TIME,
          tags: [`ACP:CHECKOUT_SESSION:${checkoutSessionId}`],
        },
      },
      operationName: "ACP:CheckoutSessionGetQuery",
    },
  );

  if (!resultCheckoutSessionGet.ok) {
    return {
      ok: false,
      error: {
        type: "invalid_request",
        code: "request_not_idempotent",
        message: "Failed to fetch checkout session.",
        param: "checkoutSessionId",
      },
    };
  }

  const variables = {
    // Common
    checkoutId: checkoutSessionId,
    languageCode: DEFAULT_LANGUAGE,
    // Buyer
    buyerEmail: "",
    buyerJSON: "",
    // Fulfillment
    fulfillmentAddressJSON: "",
    fulfillmentOptionID: "",
    shouldUpdateFulfillmentOption: false,
    // Shipping
    shippingAddress: {},
    shouldUpdateShipping: false,
    shouldUpdateEmail: false,
  } as CheckoutSessionUpdateVariables;

  if (buyer) {
    logger.info("Updating buyer email for checkout session", {
      checkoutSessionId,
      buyerEmail: buyer.email,
    });

    variables.shouldUpdateEmail = true;
    variables.buyerEmail = buyer.email;
    variables.buyerJSON = JSON.stringify(buyer);
  }

  if (fulfillment_option_id) {
    logger.info("Updating fulfillment option for checkout session", {
      checkoutSessionId,
      fulfillment_option_id,
    });

    variables.shouldUpdateFulfillmentOption = true;
    variables.fulfillmentOptionID = fulfillment_option_id;
  }

  if (fulfillment_address) {
    logger.info("Updating shipping address for checkout session", {
      checkoutSessionId,
      fulfillment_address,
    });

    variables.shouldUpdateShipping = true;
    variables.fulfillmentAddressJSON = JSON.stringify(fulfillment_address);
    variables.shippingAddress = {
      firstName: "",
      lastName: "",
      companyName: fulfillment_address.name,
      streetAddress1: fulfillment_address.line_one,
      streetAddress2: fulfillment_address.line_two,
      city: fulfillment_address.city,
      countryArea: fulfillment_address.state,
      postalCode: fulfillment_address.postal_code,
      phone: fulfillment_address.phone_number || undefined,
      country: fulfillment_address.country as AllCountryCode,
    };
  }

  if (items) {
    // Handle items update
  }

  const resultCheckoutSessionUpdate = await deps.graphqlClient.execute(
    CheckoutSessionUpdateDocument,
    {
      variables,
      operationName: "ACP:CheckoutSessionUpdateMutation",
    },
  );

  if (!resultCheckoutSessionUpdate.ok) {
    deps.logger.error("Failed to update checkout session in Saleor", {
      errors: resultCheckoutSessionUpdate.errors,
    });

    return {
      ok: false,
      error: {
        type: "invalid_request",
        code: "request_not_idempotent",
        message:
          resultCheckoutSessionUpdate.errors
            ?.map((e) => e.message)
            .join(", ") || "Failed to update checkout session.",
        param: "checkoutSessionId",
      },
    };
  }

  const shippingAddressErrors =
    resultCheckoutSessionUpdate.data.checkoutShippingAddressUpdate?.errors;
  const emailErrors =
    resultCheckoutSessionUpdate.data.checkoutEmailUpdate?.errors;

  if (shippingAddressErrors?.length || emailErrors?.length) {
    deps.logger.error("Errors returned from Saleor during checkout update", {
      shippingAddressErrors,
      emailErrors,
    });

    return {
      ok: false,
      error: {
        type: "invalid_request",
        code: "request_not_idempotent",
        message: [
          ...(shippingAddressErrors?.map((e) => e.message) || []),
          ...(emailErrors?.map((e) => e.message) || []),
        ].join(", "),
        param: shippingAddressErrors?.length ? "fulfillment_address" : "buyer",
      },
    };
  }

  const resultCheckoutGet = await deps.graphqlClient.execute(
    CheckoutSessionGetDocument,
    {
      variables: {
        id: checkoutSessionId,
        languageCode: DEFAULT_LANGUAGE,
      },
      options: {
        // Do not cache the result of this query to ensure we get the latest data
        cache: "no-store",
      },
      operationName: "ACP:CheckoutSessionGetQuery",
    },
  );

  if (!resultCheckoutGet.ok) {
    deps.logger.error("Failed to fetch updated checkout session from Saleor", {
      errors: resultCheckoutGet.errors,
    });

    return {
      ok: false,
      error: {
        type: "invalid_request",
        code: "request_not_idempotent",
        message:
          resultCheckoutGet.errors?.map((e) => e.message).join(", ") ||
          "Failed to fetch updated checkout session.",
        param: "checkoutSessionId",
      },
    };
  }

  if (!resultCheckoutGet.data.checkout) {
    deps.logger.error("No checkout found in Saleor after update", {
      checkoutId: checkoutSessionId,
    });

    return {
      ok: false,
      error: {
        type: "invalid_request",
        code: "request_not_idempotent",
        message: "No checkout found after update.",
        param: "checkoutSessionId",
      },
    };
  }

  return {
    ok: true,
    data: validateAndSerializeCheckout(resultCheckoutGet.data.checkout, {
      storefrontUrl: deps.storefrontUrl,
      logger: deps.logger,
    })!,
  };
};
