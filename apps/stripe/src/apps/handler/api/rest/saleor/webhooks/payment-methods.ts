import { container } from "@/container";
import {
  type ListStoredPaymentMethodsSubscription,
  type PaymentMethodInitializeTokenizationSessionSubscription,
  type PaymentMethodProcessTokenizationSessionSubscription,
  type StoredPaymentMethodDeleteRequestedSubscription,
} from "@/graphql/generated/client";
import { responseFromErrors } from "@/lib/api/util";

import { type HandlerContext } from "./types";

export const storedPaymentMethodListHandler = async (
  context: HandlerContext<ListStoredPaymentMethodsSubscription>,
) => {
  const result = await container
    .get("paymentMethodService")
    .listStoredPaymentMethods({
      event: context.req.valid("json"),
      saleorDomain: context.req.valid("header")["saleor-domain"],
    });

  if (!result.ok) {
    return responseFromErrors(result.errors);
  }

  return context.json(result.data);
};

export const storedPaymentMethodDeleteRequestedHandler = async (
  context: HandlerContext<StoredPaymentMethodDeleteRequestedSubscription>,
) => {
  const result = await container
    .get("paymentMethodService")
    .deleteStoredPaymentMethod({
      event: context.req.valid("json"),
      saleorDomain: context.req.valid("header")["saleor-domain"],
    });

  if (!result.ok) {
    return responseFromErrors(result.errors);
  }

  return context.json(result.data);
};

export const paymentMethodInitializeTokenizationSessionHandler = async (
  context: HandlerContext<PaymentMethodInitializeTokenizationSessionSubscription>,
) => {
  const result = await container
    .get("paymentMethodService")
    .initializeTokenization({
      event: context.req.valid("json"),
      saleorDomain: context.req.valid("header")["saleor-domain"],
    });

  if (!result.ok) {
    return responseFromErrors(result.errors);
  }

  return context.json(result.data);
};

export const paymentMethodProcessTokenizationSessionHandler = async (
  context: HandlerContext<PaymentMethodProcessTokenizationSessionSubscription>,
) => {
  const result = await container
    .get("paymentMethodService")
    .processTokenization({
      event: context.req.valid("json"),
      saleorDomain: context.req.valid("header")["saleor-domain"],
    });

  if (!result.ok) {
    return responseFromErrors(result.errors);
  }

  return context.json(result.data);
};
