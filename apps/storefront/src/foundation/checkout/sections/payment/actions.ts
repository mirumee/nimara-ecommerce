"use server";

import { revalidatePath } from "next/cache";

import { type AllCountryCode } from "@nimara/domain/consts";
import { type Checkout } from "@nimara/domain/objects/Checkout";
import { type AsyncResult } from "@nimara/domain/objects/Result";
import { schemaToAddress } from "@nimara/foundation/address/address";

import { createAddressAction } from "@/foundation/address/create-address-action";
import { updateCheckoutAddressAction } from "@/foundation/checkout/actions/update-checkout-address-action";
import { paths } from "@/foundation/routing/paths";
import { storefrontLogger } from "@/services/logging";
import { getServiceRegistry } from "@/services/registry";
import { getAccessToken } from "@/services/tokens";

import { type PaymentSchema } from "./schema";

export async function updateBillingAddress({
  checkout,
  input: { sameAsShippingAddress, billingAddress, saveAddressForFutureUse },
}: {
  checkout: Checkout;
  input: Pick<
    PaymentSchema,
    "sameAsShippingAddress" | "billingAddress" | "saveAddressForFutureUse"
  >;
}) {
  const result = await updateCheckoutAddressAction({
    id: checkout.id,
    address: sameAsShippingAddress
      ? checkout.shippingAddress!
      : schemaToAddress(billingAddress!),
    type: "BILLING",
  });

  if (saveAddressForFutureUse) {
    const accessToken = await getAccessToken();

    if (accessToken) {
      await createAddressAction({
        accessToken,
        address: {
          ...billingAddress,
          country: billingAddress?.country as AllCountryCode,
        },
        type: "BILLING",
      });
    } else {
      storefrontLogger.error(
        "Access token not found while creating checkout billing address. Skipping address creation.",
      );
    }
  }

  if (result.ok) {
    revalidatePath(paths.checkout.asPath());
  }

  return result;
}

interface InitializePaymentGatewayPayload {
  amount: number;
  id: Checkout["id"];
}

export const initializePaymentGateway = async ({
  amount,
  id,
}: InitializePaymentGatewayPayload): AsyncResult<{ success: boolean }> => {
  const services = await getServiceRegistry();
  const paymentService = await services.getPaymentService();

  return paymentService.paymentGatewayInitialize({
    amount,
    id,
  });
};

interface InitializePaymentTransactionPayload {
  amount: number;
  customerId?: string | null;
  id: Checkout["id"];
  paymentMethod?: string;
  saveForFutureUse?: boolean;
}

export const initializePaymentTransaction = async ({
  amount,
  customerId,
  id,
  paymentMethod,
  saveForFutureUse,
}: InitializePaymentTransactionPayload) => {
  const services = await getServiceRegistry();
  const paymentService = await services.getPaymentService();

  return paymentService.paymentGatewayTransactionInitialize({
    amount,
    customerId: customerId ?? undefined,
    id,
    paymentMethod,
    saveForFutureUse,
  });
};
