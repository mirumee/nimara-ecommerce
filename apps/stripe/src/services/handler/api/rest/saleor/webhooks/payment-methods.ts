import { responseFromErrors } from "@nimara/lib/hono/api/util";
import { type HandlerContext } from "@nimara/lib/hono/saleor/types";
import { type SaleorTenant } from "@nimara/lib/saleor/tenant";

import { container } from "@/container";
import {
  type ListStoredPaymentMethodsSubscription,
  type PaymentMethodInitializeTokenizationSessionSubscription,
  type PaymentMethodProcessTokenizationSessionSubscription,
  type StoredPaymentMethodDeleteRequestedSubscription,
} from "@/graphql/generated/client";

export const storedPaymentMethodListHandler = async (
  context: HandlerContext<ListStoredPaymentMethodsSubscription>,
  { saleorDomain }: SaleorTenant,
) => {
  const result = await container
    .get("paymentMethodService")
    .listStoredPaymentMethods({
      event: context.req.valid("json"),
      saleorDomain,
    });

  if (!result.ok) {
    return responseFromErrors(result.errors);
  }

  return context.json(result.data);
};

export const storedPaymentMethodDeleteRequestedHandler = async (
  context: HandlerContext<StoredPaymentMethodDeleteRequestedSubscription>,
  { saleorDomain }: SaleorTenant,
) => {
  const result = await container
    .get("paymentMethodService")
    .deleteStoredPaymentMethod({
      event: context.req.valid("json"),
      saleorDomain,
    });

  if (!result.ok) {
    return responseFromErrors(result.errors);
  }

  return context.json(result.data);
};

export const paymentMethodInitializeTokenizationSessionHandler = async (
  context: HandlerContext<PaymentMethodInitializeTokenizationSessionSubscription>,
  { saleorDomain }: SaleorTenant,
) => {
  const result = await container
    .get("paymentMethodService")
    .initializeTokenization({
      event: context.req.valid("json"),
      saleorDomain,
    });

  if (!result.ok) {
    return responseFromErrors(result.errors);
  }

  return context.json(result.data);
};

export const paymentMethodProcessTokenizationSessionHandler = async (
  context: HandlerContext<PaymentMethodProcessTokenizationSessionSubscription>,
  { saleorDomain }: SaleorTenant,
) => {
  const result = await container
    .get("paymentMethodService")
    .processTokenization({
      event: context.req.valid("json"),
      saleorDomain,
    });

  if (!result.ok) {
    return responseFromErrors(result.errors);
  }

  return context.json(result.data);
};
