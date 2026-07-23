"use server";

import { type Locale } from "next-intl";
import { getLocale } from "next-intl/server";

import { type AppErrorCode } from "@nimara/domain/objects/Error";
import { redirect } from "@nimara/i18n/routing";
import { QUERY_PARAMS as PAYMENT_QUERY_PARAMS } from "@nimara/infrastructure/payment/consts";
import { isCheckoutPaid } from "@nimara/infrastructure/payment/helpers";

import { clientEnvs } from "@/envs/client";
import {
  getCheckoutOrRedirect,
  getMarketplaceCheckoutsOrRedirect,
} from "@/features/checkout/checkout-actions";
import { paths, QUERY_PARAMS } from "@/foundation/routing/paths";
import { getServiceRegistry } from "@/services/registry";

export type ProcessPaymentResult =
  | { orderId: string }
  | { isProcessing: true }
  | { errors: { code: AppErrorCode }[] };

/**
 * Marketplace checkouts convert into multiple orders — the confirmation page
 * shows a generic thank-you, so a placeholder stands in for the order id.
 */
const MARKETPLACE_ORDER_PLACEHOLDER_ID = "marketplace";

/**
 * Stripe redirect statuses that mean the payment definitively failed. *
 */
const FAILED_REDIRECT_STATUSES = ["failed", "requires_payment_method"];

const redirectToPaymentStep = ({
  errorCode,
  locale,
}: {
  errorCode: AppErrorCode;
  locale: Locale;
}): never =>
  redirect({
    href: paths.checkout.asPath({
      query: {
        step: "payment",
        [QUERY_PARAMS.errorCode]: errorCode,
      },
    }),
    locale,
  });

/**
 * Standard checkout: the Saleor transaction from the return URL drives the
 * outcome — process it, then convert the checkout into an order.
 */
const processCheckoutPayment = async ({
  searchParams,
}: {
  searchParams: Record<string, string>;
}): Promise<ProcessPaymentResult> => {
  const [locale, checkout, services] = await Promise.all([
    getLocale(),
    /**
     * Fetch a fresh checkout on every (re)poll — a cached one would keep
     * reporting the payment as unpaid until the cache TTL expires.
     */
    getCheckoutOrRedirect({ cache: "no-store" }),
    getServiceRegistry(),
  ]);

  const transactionId = searchParams[PAYMENT_QUERY_PARAMS.TRANSACTION_ID];

  if (transactionId) {
    const paymentService = await services.getPaymentService();

    const resultProcess = await paymentService.process({
      transaction: { id: transactionId },
    });

    // 1. Payment processing errored — redirect back to the payment step.
    if (!resultProcess.ok) {
      return redirectToPaymentStep({
        errorCode: resultProcess.errors[0].code,
        locale,
      });
    }

    // 2. Saleor already created the order off the processed transaction.
    if (resultProcess.data.orderId) {
      return { orderId: resultProcess.data.orderId };
    }

    // 3. Payment requires further action / async confirmation — re-poll.
    if (resultProcess.data.actionRequired) {
      return { isProcessing: true };
    }
  } else if (!isCheckoutPaid(checkout)) {
    // Without a transaction the paid state is the only signal — re-poll.
    return { isProcessing: true };
  }

  // 4. Payment succeeded — create the order.
  const checkoutService = await services.getCheckoutService();
  const resultOrderCreate = await checkoutService.orderCreate({
    id: checkout.id,
  });

  if (resultOrderCreate.ok) {
    return { orderId: resultOrderCreate.data.orderId };
  }

  return { errors: resultOrderCreate.errors };
};

/**
 * Marketplace: payments run on marketplace payment intents — there is no
 * Saleor transaction to process. The payment webhook marks the checkouts as
 * paid; poll for that, then convert every vendor checkout into an order.
 */
const processMarketplacePayment = async ({
  searchParams,
}: {
  searchParams: Record<string, string>;
}): Promise<ProcessPaymentResult> => {
  const [locale, checkoutItems, services] = await Promise.all([
    getLocale(),
    /**
     * Fetch fresh checkouts on every (re)poll — cached ones would keep
     * reporting the payment as unpaid until the cache TTL expires.
     */
    getMarketplaceCheckoutsOrRedirect({ cache: "no-store" }),
    getServiceRegistry(),
  ]);

  const redirectStatus = searchParams[PAYMENT_QUERY_PARAMS.REDIRECT_STATUS];

  // Only an explicit failure bails out early — "processing" (async payment
  // methods) and a missing status defer to the paid-state polling below.
  if (redirectStatus && FAILED_REDIRECT_STATUSES.includes(redirectStatus)) {
    return redirectToPaymentStep({
      errorCode: "GENERIC_PAYMENT_ERROR",
      locale,
    });
  }

  if (!checkoutItems.every(({ checkout }) => isCheckoutPaid(checkout))) {
    return { isProcessing: true };
  }

  const checkoutService = await services.getCheckoutService();
  const resultsOrderCreate = await Promise.all(
    checkoutItems.map(({ checkout }) =>
      checkoutService.orderCreate({ id: checkout.id }),
    ),
  );
  const errors = resultsOrderCreate.flatMap((result) =>
    result.ok ? [] : result.errors,
  );

  if (errors.length) {
    return { errors };
  }

  return { orderId: MARKETPLACE_ORDER_PLACEHOLDER_ID };
};

export const processPaymentAction = async ({
  searchParams,
}: {
  searchParams: Record<string, string>;
}): Promise<ProcessPaymentResult> =>
  clientEnvs.NEXT_PUBLIC_MARKETPLACE_ENABLED
    ? processMarketplacePayment({ searchParams })
    : processCheckoutPayment({ searchParams });
