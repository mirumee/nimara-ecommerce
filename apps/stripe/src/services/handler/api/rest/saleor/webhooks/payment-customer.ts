import { type BaseError } from "@nimara/domain/objects/Error";
import { type Logger } from "@nimara/infrastructure/logging/types";

import { container } from "@/container";
import { type PaymentMethodUser } from "@/domain/customer";
import { type StripeGateway } from "@/infrastructure/payment/stripe/gateway";

export type PaymentCustomerResult =
  | { customerId: string | null; ok: true; saveForFutureUse: boolean }
  | { ok: false; refusal: string }
  | { errors: readonly BaseError[]; ok: false };

export const resolvePaymentCustomer = async ({
  channelSlug,
  gateway,
  logger,
  paymentMethodId,
  saleorDomain,
  saveForFutureUse,
  transactionId,
  user,
}: {
  channelSlug: string;
  gateway: StripeGateway;
  logger: Logger;
  paymentMethodId?: string;
  saleorDomain: string;
  saveForFutureUse?: boolean;
  transactionId: string;
  user: PaymentMethodUser | null;
}): Promise<PaymentCustomerResult> => {
  /**
   * Saved payment methods exist only for signed-in shoppers: payments attach
   * to their gateway user (payment history, fraud signals), saved methods
   * are verified against it, and the save wish requires it.
   */
  let customerId: string | null = null;

  if (user) {
    const customerResult = await container
      .get("paymentMethodService")
      .resolveCustomer({ channelSlug, saleorDomain, user });

    if (customerResult.ok) {
      customerId = customerResult.data;
    } else {
      // Failed resolution should not break the checkout.
      logger.warning("Proceeding without a gateway user.", {
        channelSlug,
        errors: customerResult.errors,
        transactionId,
        userId: user.id,
      });
    }
  }

  if (paymentMethodId) {
    // A saved method without a resolved owner cannot be verified.
    if (!customerId) {
      return {
        ok: false,
        refusal: user
          ? "Could not resolve the customer for this payment."
          : "Saved payment methods require a signed in customer.",
      };
    }

    const paymentMethodResult = await gateway.retrievePaymentMethodCustomerId({
      id: paymentMethodId,
    });

    if (!paymentMethodResult.ok) {
      return { ok: false, errors: paymentMethodResult.errors };
    }

    if (!paymentMethodResult.data) {
      logger.warning("Payment attempted with an unknown payment method.", {
        channelSlug,
        paymentMethodId,
        transactionId,
        userId: user?.id,
      });

      return { ok: false, refusal: "Payment method does not exist." };
    }

    if (paymentMethodResult.data.customerId !== customerId) {
      logger.warning("Payment attempted with a foreign payment method.", {
        channelSlug,
        paymentMethodId,
        transactionId,
        userId: user?.id,
      });

      return {
        ok: false,
        refusal: "Payment method does not belong to this customer.",
      };
    }
  }

  // Saving needs a gateway user.
  if (saveForFutureUse && !customerId) {
    logger.warning("Ignoring save for future use without a gateway user.", {
      channelSlug,
      transactionId,
      userId: user?.id,
    });
  }

  return {
    customerId,
    ok: true,
    saveForFutureUse: customerId ? !!saveForFutureUse : false,
  };
};
