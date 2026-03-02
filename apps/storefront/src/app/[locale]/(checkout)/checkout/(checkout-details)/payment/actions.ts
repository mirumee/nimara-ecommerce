"use server";

import { type AllCountryCode } from "@nimara/domain/consts";
import { type Checkout } from "@nimara/domain/objects/Checkout";
import { type AsyncResult, err, ok } from "@nimara/domain/objects/Result";

import { getAccessToken } from "@/auth";
import { updateCheckoutAddressAction } from "@/lib/actions/update-checkout-address-action";
import { schemaToAddress } from "@/lib/address";
import {
  checkoutCompleteMarketplace,
  createMarketplacePaymentIntent,
} from "@/lib/marketplace/poc-payments-client";
import { getUserService } from "@/services/user";

import { type Schema } from "./schema";

export async function updateBillingAddress({
  checkout,
  input: { sameAsShippingAddress, billingAddress, saveAddressForFutureUse },
}: {
  checkout: Checkout;
  input: Pick<
    Schema,
    "sameAsShippingAddress" | "billingAddress" | "saveAddressForFutureUse"
  >;
}) {
  if (sameAsShippingAddress && !checkout.shippingAddress) {
    return err([
      {
        code: "CHECKOUT_BILLING_ADDRESS_UPDATE_ERROR",
        field: "billingAddress",
      },
    ]);
  }

  const result = await updateCheckoutAddressAction({
    checkoutId: checkout.id,
    address: sameAsShippingAddress
      ? checkout.shippingAddress!
      : schemaToAddress(billingAddress!),
    type: "billing",
  });

  if (saveAddressForFutureUse) {
    const [accessToken, userService] = await Promise.all([
      getAccessToken(),
      getUserService(),
    ]);

    await userService.accountAddressCreate({
      accessToken,
      input: {
        ...billingAddress,
        country: billingAddress?.country as AllCountryCode,
      },
      type: "BILLING",
    });
  }

  return result;
}

export const initializeMarketplacePayment = async ({
  checkoutIds,
  buyerId,
}: {
  buyerId: string;
  checkoutIds: string[];
}): AsyncResult<{ clientSecret: string; orderIds: string[] }> => {
  try {
    const uniqueCheckoutIds = [...new Set(checkoutIds.filter(Boolean))];

    if (!uniqueCheckoutIds.length) {
      return err([
        {
          code: "CHECKOUT_NOT_FOUND_ERROR",
        },
      ]);
    }

    const resultCheckoutComplete =
      await checkoutCompleteMarketplace(uniqueCheckoutIds);

    if (!resultCheckoutComplete.ok) {
      return err([
        {
          code: "CHECKOUT_COMPLETE_ERROR",
        },
      ]);
    }

    const { completedOrders, failedCheckouts } = resultCheckoutComplete.data;

    if (!completedOrders.length || failedCheckouts.length > 0) {
      return err([
        {
          code: "CHECKOUT_COMPLETE_ERROR",
        },
      ]);
    }

    const currencies = new Set(
      completedOrders.map((order) => order.currency.toUpperCase()),
    );

    if (currencies.size > 1) {
      return err([
        {
          code: "CHECKOUT_COMPLETE_ERROR",
        },
      ]);
    }

    const resultPaymentIntent = await createMarketplacePaymentIntent({
      buyerId,
      orders: completedOrders.map((order) => ({
        orderId: order.orderId,
        amount: order.amount,
        currency: order.currency,
      })),
    });

    if (!resultPaymentIntent.ok || !resultPaymentIntent.data.clientSecret) {
      return err([
        {
          code: "TRANSACTION_INITIALIZE_ERROR",
        },
      ]);
    }

    return ok({
      clientSecret: resultPaymentIntent.data.clientSecret,
      orderIds: completedOrders.map((order) => order.orderId),
    });
  } catch {
    return err([
      {
        code: "TRANSACTION_INITIALIZE_ERROR",
      },
    ]);
  }
};
