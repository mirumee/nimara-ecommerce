import { type NextRequest, NextResponse } from "next/server";

import type { TransactionCreateVariables } from "@/graphql/generated/client";
import { getAppConfig } from "@/lib/saleor/app-config";
import { verifyStripeWebhookSignature } from "@/lib/stripe/webhook-signature";
import { checkoutService } from "@/services/checkouts";
import { marketplaceLogger } from "@/services/logging";
import { transactionsService } from "@/services/transactions";

type StripePaymentIntentSucceededEvent = {
  data?: {
    object?: {
      currency?: string;
      id?: string;
      metadata?: {
        checkout_amounts?: string;
        saleor_domain?: string;
        subcheckouts?: string;
      };
    };
  };
  id?: string;
  type?: string;
};

type FailedTransactionCreate = {
  checkoutId: string;
  errors: Array<{ code: string; message: string }>;
};

type ServiceError = {
  code: string;
  message: string;
};

type TransactionCreatePayload = {
  errors: Array<{ code: string; message: string | null }>;
  transaction: { id: string; name: string } | null;
};

type CheckoutTransactionsPayload = {
  checkout: {
    transactions: Array<{
      chargedAmount: { amount: number } | null;
      pspReference: string | null;
    }> | null;
  } | null;
};

type CheckoutCompletePayload = {
  checkoutComplete: {
    errors: Array<{ code: string; message: string | null }>;
    order: { id: string } | null;
  } | null;
};

const isCheckoutCompleteNotFoundError = (code: string) => code === "NOT_FOUND";

const mapCheckoutCompleteErrors = (
  errors: Array<{ code: string; message?: string | null }>,
): ServiceError[] =>
  errors
    .filter((error) => !isCheckoutCompleteNotFoundError(error.code))
    .map((error) => ({
      code: error.code,
      message: error.message ?? "checkoutComplete failed.",
    }));

const mapCheckoutCompleteRequestFailure = (error: unknown): ServiceError[] => [
  {
    code: "CHECKOUT_COMPLETE_REQUEST_FAILED",
    message:
      error instanceof Error
        ? error.message
        : "checkoutComplete request failed.",
  },
];

const getSaleorDomainFromEnv = () => {
  const saleorUrl = process.env.NEXT_PUBLIC_SALEOR_URL;

  if (!saleorUrl) {
    return null;
  }

  try {
    return new URL(saleorUrl).hostname;
  } catch {
    return null;
  }
};

export async function POST(request: NextRequest) {
  const stripeSignature = request.headers.get("stripe-signature");

  if (!stripeSignature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header." },
      { status: 400 },
    );
  }

  const rawPayload = await request.text();
  const isValidSignature = verifyStripeWebhookSignature({
    payload: rawPayload,
    stripeSignature,
  });

  if (!isValidSignature) {
    return NextResponse.json(
      { error: "Invalid Stripe webhook signature." },
      { status: 400 },
    );
  }

  let event: StripePaymentIntentSucceededEvent;

  try {
    event = JSON.parse(rawPayload) as StripePaymentIntentSucceededEvent;
  } catch {
    return NextResponse.json(
      { error: "Invalid Stripe payload." },
      { status: 400 },
    );
  }

  if (event.type !== "payment_intent.succeeded") {
    return NextResponse.json({ status: "skipped" }, { status: 200 });
  }

  const paymentIntent = event.data?.object;
  const paymentIntentId = paymentIntent?.id;
  const currency = paymentIntent?.currency?.toUpperCase();
  const checkoutIdsRaw = paymentIntent?.metadata?.subcheckouts;
  const checkoutAmountsRaw = paymentIntent?.metadata?.checkout_amounts;

  if (!paymentIntentId || !currency || !checkoutIdsRaw || !checkoutAmountsRaw) {
    return NextResponse.json(
      { error: "Missing required PaymentIntent metadata." },
      { status: 500 },
    );
  }

  const saleorDomain =
    paymentIntent.metadata?.saleor_domain ?? getSaleorDomainFromEnv();

  if (!saleorDomain) {
    return NextResponse.json(
      {
        error:
          "Missing saleor domain in PaymentIntent metadata and NEXT_PUBLIC_SALEOR_URL.",
      },
      { status: 500 },
    );
  }

  let checkoutIds: string[];
  let checkoutAmounts: Record<string, number>;

  try {
    const parsedCheckoutIds = JSON.parse(checkoutIdsRaw) as unknown;
    const parsedCheckoutAmounts = JSON.parse(checkoutAmountsRaw) as unknown;

    if (!Array.isArray(parsedCheckoutIds)) {
      throw new Error("subcheckouts should be an array");
    }

    checkoutIds = parsedCheckoutIds.map((id) => String(id));

    if (
      typeof parsedCheckoutAmounts !== "object" ||
      parsedCheckoutAmounts === null ||
      Array.isArray(parsedCheckoutAmounts)
    ) {
      throw new Error("checkout_amounts should be an object");
    }

    const checkoutAmountsRecord = parsedCheckoutAmounts as Record<
      string,
      unknown
    >;

    checkoutAmounts = Object.fromEntries(
      Object.entries(checkoutAmountsRecord).map(([checkoutId, amount]) => [
        checkoutId,
        Number(amount),
      ]),
    );
  } catch {
    return NextResponse.json(
      { error: "Invalid PaymentIntent metadata payload." },
      { status: 500 },
    );
  }

  const invalidCheckoutAmount = checkoutIds.find((checkoutId) => {
    const amount = checkoutAmounts[checkoutId];

    return !Number.isFinite(amount);
  });

  if (invalidCheckoutAmount) {
    return NextResponse.json(
      {
        error: `Missing/invalid checkout amount for ${invalidCheckoutAmount}.`,
      },
      { status: 500 },
    );
  }

  const config = await getAppConfig(saleorDomain);

  if (!config) {
    return NextResponse.json(
      { error: `Missing app config for domain ${saleorDomain}` },
      { status: 500 },
    );
  }

  const completeCheckout = async (
    checkoutId: string,
  ): Promise<ServiceError[]> => {
    const checkoutCompleteResult = await checkoutService.completeCheckout(
      { id: checkoutId },
      config.authToken,
    );

    if (!checkoutCompleteResult.ok) {
      const mappedCheckoutCompleteErrors = mapCheckoutCompleteErrors(
        checkoutCompleteResult.errors,
      );

      if (
        mappedCheckoutCompleteErrors.length === 0 &&
        checkoutCompleteResult.errors.length > 0
      ) {
        return [];
      }

      if (mappedCheckoutCompleteErrors.length === 0) {
        return [
          {
            code: "UNKNOWN_CHECKOUT_COMPLETE_ERROR",
            message: "checkoutComplete failed without error details.",
          },
        ];
      }

      return mappedCheckoutCompleteErrors;
    }

    const checkoutCompleteResultData =
      checkoutCompleteResult.data as CheckoutCompletePayload;
    const rawCheckoutCompleteErrors =
      checkoutCompleteResultData.checkoutComplete?.errors ?? [];
    const mappedCheckoutCompleteErrors = mapCheckoutCompleteErrors(
      rawCheckoutCompleteErrors,
    );
    const hasOnlyNotFoundErrors =
      rawCheckoutCompleteErrors.length > 0 &&
      rawCheckoutCompleteErrors.every((error) =>
        isCheckoutCompleteNotFoundError(error.code),
      );

    if (mappedCheckoutCompleteErrors.length > 0) {
      return mappedCheckoutCompleteErrors;
    }

    if (
      checkoutCompleteResultData.checkoutComplete?.order ||
      hasOnlyNotFoundErrors
    ) {
      return [];
    }

    return [
      {
        code: "UNKNOWN_CHECKOUT_COMPLETE_ERROR",
        message: "checkoutComplete returned no order and no error details.",
      },
    ];
  };

  const settled = await Promise.allSettled(
    checkoutIds.map(async (checkoutId) => {
      const amount = checkoutAmounts[checkoutId];
      const checkoutTransactionsResult =
        await transactionsService.getCheckoutTransactions(
          { id: checkoutId },
          config.authToken,
        );

      if (!checkoutTransactionsResult.ok) {
        return {
          transaction: null,
          errors: checkoutTransactionsResult.errors.map((error) => ({
            code: error.code,
            message: error.message ?? "checkout query failed.",
          })),
        };
      }

      const checkoutTransactionsData =
        checkoutTransactionsResult.data as CheckoutTransactionsPayload;
      const alreadyCharged =
        checkoutTransactionsData.checkout?.transactions?.some((transaction) => {
          if (transaction.pspReference !== paymentIntentId) {
            return false;
          }

          return (transaction.chargedAmount?.amount ?? 0) > 0;
        }) ?? false;

      if (alreadyCharged) {
        marketplaceLogger.warning(
          "Stripe webhook recovery path: checkout already charged, retrying checkoutComplete.",
          {
            checkoutId,
            eventId: event.id,
            paymentIntentId,
            saleorDomain,
          },
        );

        let checkoutCompleteErrors: ServiceError[];

        try {
          checkoutCompleteErrors = await completeCheckout(checkoutId);
        } catch (error) {
          checkoutCompleteErrors = mapCheckoutCompleteRequestFailure(error);
        }

        if (checkoutCompleteErrors.length > 0) {
          return {
            transaction: null,
            errors: checkoutCompleteErrors,
          };
        }

        return {
          transaction: {
            id: "already-processed",
            name: "PaymentIntent Succeeded",
          },
          errors: [],
        };
      }

      const transactionVariables: TransactionCreateVariables = {
        id: checkoutId,
        transaction: {
          name: "PaymentIntent Succeeded",
          amountCharged: {
            amount,
            currency,
          },
          pspReference: paymentIntentId,
        },
        transactionEvent: {
          pspReference: paymentIntentId,
          message: "Payment successful",
        },
      };
      const transactionCreateResult =
        await transactionsService.createTransaction(
          transactionVariables,
          config.authToken,
        );

      if (!transactionCreateResult.ok) {
        return {
          transaction: null,
          errors: transactionCreateResult.errors.map((error) => ({
            code: error.code,
            message: error.message ?? "transactionCreate failed.",
          })),
        };
      }

      const transactionCreateResultData = transactionCreateResult.data as
        | TransactionCreatePayload
        | { transactionCreate: TransactionCreatePayload | null };
      const transactionCreatePayload =
        "transactionCreate" in transactionCreateResultData
          ? transactionCreateResultData.transactionCreate
          : transactionCreateResultData;

      if (
        !transactionCreatePayload?.transaction ||
        transactionCreatePayload.errors.length > 0
      ) {
        const mappedErrors = transactionCreatePayload?.errors.map((error) => ({
          code: error.code,
          message: error.message ?? "Unknown transactionCreate error.",
        }));

        return {
          transaction: null,
          errors:
            mappedErrors && mappedErrors.length > 0
              ? mappedErrors
              : [
                  {
                    code: "UNKNOWN_TRANSACTION_CREATE_ERROR",
                    message:
                      "transactionCreate returned no transaction and no error details.",
                  },
                ],
        };
      }

      let checkoutCompleteErrors: ServiceError[];

      try {
        checkoutCompleteErrors = await completeCheckout(checkoutId);
      } catch (error) {
        checkoutCompleteErrors = mapCheckoutCompleteRequestFailure(error);
      }

      if (checkoutCompleteErrors.length > 0) {
        return {
          transaction: null,
          errors: checkoutCompleteErrors,
        };
      }

      return {
        transaction: transactionCreatePayload.transaction,
        errors: [],
      };
    }),
  );

  const failedTransactionCreates: FailedTransactionCreate[] = [];
  let createdTransactionsCount = 0;

  settled.forEach((entry, index) => {
    const checkoutId = checkoutIds[index];

    if (!checkoutId) {
      return;
    }

    if (entry.status === "rejected") {
      failedTransactionCreates.push({
        checkoutId,
        errors: [
          {
            code: "REQUEST_FAILED",
            message:
              entry.reason instanceof Error
                ? entry.reason.message
                : "transactionCreate failed.",
          },
        ],
      });

      return;
    }

    if (entry.value.errors.length > 0 || !entry.value.transaction) {
      failedTransactionCreates.push({
        checkoutId,
        errors: entry.value.errors.map((error) => ({
          code: error.code,
          message: error.message ?? "Unknown transactionCreate error.",
        })),
      });

      return;
    }

    createdTransactionsCount += 1;
  });

  const hasAtLeastOneCreated = createdTransactionsCount > 0;
  const hasFailures = failedTransactionCreates.length > 0;

  if (hasFailures) {
    const errorResponse = {
      error: "Failed to create transaction for one or more checkouts.",
      paymentIntentId,
      failedTransactionCreates,
    };

    if (hasAtLeastOneCreated) {
      return NextResponse.json(errorResponse, { status: 200 });
    }

    return NextResponse.json(errorResponse, { status: 500 });
  }

  return NextResponse.json({ status: "processed", paymentIntentId });
}
