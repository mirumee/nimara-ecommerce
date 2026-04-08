"use server";

import { revalidatePath } from "next/cache";

import { type AllCountryCode } from "@nimara/domain/consts";
import { type Checkout } from "@nimara/domain/objects/Checkout";
import { type AsyncResult, err, ok } from "@nimara/domain/objects/Result";
import { schemaToAddress } from "@nimara/foundation/address/address";

import { clientEnvs } from "@/envs/client";
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

export const initializeMarketplacePaymentIntent = async ({
  buyerId,
  checkouts,
}: {
  buyerId?: string;
  checkouts: Array<{
    amount: number;
    checkoutId: string;
    currency: string;
  }>;
}): AsyncResult<{ clientSecret: string }> => {
  const marketplaceVendorUrl = process.env.NEXT_PUBLIC_MARKETPLACE_VENDOR_URL;

  if (!marketplaceVendorUrl) {
    return err([{ code: "GENERIC_PAYMENT_ERROR" }]);
  }

  const normalizedBaseUrl = marketplaceVendorUrl.startsWith("http")
    ? marketplaceVendorUrl
    : `https://${marketplaceVendorUrl}`;

  let saleorDomain: string;

  try {
    saleorDomain = new URL(clientEnvs.NEXT_PUBLIC_SALEOR_API_URL).hostname;
  } catch {
    return err([{ code: "GENERIC_PAYMENT_ERROR" }]);
  }

  try {
    const response = await fetch(
      `${normalizedBaseUrl.replace(/\/$/, "")}/api/payments/payment-intent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-saleor-domain": saleorDomain,
        },
        body: JSON.stringify({
          checkouts,
          buyerId,
        }),
        cache: "no-store",
      },
    );

    if (!response.ok) {
      let responseBody = "";

      try {
        responseBody = await response.text();
      } catch {
        responseBody = "";
      }

      storefrontLogger.error(
        "Marketplace payment intent initialization failed",
        {
          checkoutsCount: checkouts.length,
          responseBodyPreview: responseBody.slice(0, 600),
          saleorDomain,
          status: response.status,
          statusText: response.statusText,
        },
      );

      return err([{ code: "GENERIC_PAYMENT_ERROR" }]);
    }

    const payload = (await response.json()) as { clientSecret?: string };

    if (!payload.clientSecret) {
      return err([{ code: "GENERIC_PAYMENT_ERROR" }]);
    }

    return ok({
      clientSecret: payload.clientSecret,
    });
  } catch {
    return err([{ code: "GENERIC_PAYMENT_ERROR" }]);
  }
};
