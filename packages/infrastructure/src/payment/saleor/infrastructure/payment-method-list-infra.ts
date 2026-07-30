import type { PaymentMethod } from "@nimara/domain/objects/Payment";
import { ok } from "@nimara/domain/objects/Result";

import { graphqlClient } from "#root/graphql/client";

import type { PaymentMethodListInfra, PaymentServiceConfig } from "../../types";
import { StoredPaymentMethodListQueryDocument } from "../graphql/queries/generated";

/**
 * The payment app is free to put anything in `data`; only the default flag is
 * part of the contract with this storefront.
 */
const isDefaultMethod = (data: unknown) =>
  !!(data as { isDefault?: boolean } | null)?.isDefault;

export const paymentMethodListInfra =
  ({ apiURI, logger }: PaymentServiceConfig): PaymentMethodListInfra =>
  async ({ accessToken, channel, options }) => {
    const result = await graphqlClient(apiURI, accessToken).execute(
      StoredPaymentMethodListQueryDocument,
      {
        variables: { channel },
        options,
        operationName: "StoredPaymentMethodListQuery",
      },
    );

    if (!result.ok) {
      logger.error("Failed to fetch stored payment methods.", {
        channel,
        errors: result.errors,
      });

      return result;
    }

    const storedPaymentMethods = result.data.me?.storedPaymentMethods ?? [];

    return ok(
      storedPaymentMethods
        .map((method): PaymentMethod => {
          const base = {
            id: method.id,
            isDefault: isDefaultMethod(method.data),
            name: method.name ?? "",
            token: method.paymentMethodId,
          };

          if (method.type === "card" && method.creditCardInfo) {
            return {
              ...base,
              type: "card",
              paymentMethod: {
                brand: method.creditCardInfo.brand,
                expMonth: method.creditCardInfo.expMonth?.toString() ?? "",
                expYear: method.creditCardInfo.expYear?.toString() ?? "",
                last4: method.creditCardInfo.lastDigits,
              },
            };
          }

          if (method.type === "paypal") {
            return {
              ...base,
              type: "paypal",
              paymentMethod: { email: method.name ?? "" },
            };
          }

          /**
           * A type with no dedicated presentation still belongs in the list:
           * the customer has it stored and must be able to remove it. It
           * carries the app's label and the gateway's own type name.
           */
          return {
            ...base,
            type: "other",
            paymentMethod: null,
            providerType: method.type,
          };
        }),
    );
  };
