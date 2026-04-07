import { createHash, randomUUID } from "crypto";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import type { TransactionCreateVariables } from "@/graphql/generated/client";
import { getServerAuthToken } from "@/lib/auth/server";
import { getAppConfig } from "@/lib/saleor/app-config";
import { getStripeClient } from "@/lib/stripe/client";
import { getCentsFromAmount } from "@/lib/stripe/currency";
import { marketplaceLogger } from "@/services/logging";
import { transactionsService } from "@/services/transactions";

const bodySchema = z
  .object({
    buyerId: z.string().optional(),
    checkouts: z
      .array(
        z.object({
          checkoutId: z.string().min(1),
          amount: z.number().positive(),
          currency: z.string().length(3),
        }),
      )
      .min(1),
  })
  .superRefine((data, ctx) => {
    const uniqueIds = new Set(
      data.checkouts.map((checkout) => checkout.checkoutId),
    );

    if (uniqueIds.size !== data.checkouts.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["checkouts"],
        message: "checkoutId must be unique in checkouts array.",
      });
    }
  });

type FailedTransactionCreate = {
  checkoutId: string;
  errors: Array<{ code: string; message: string }>;
};

type TransactionCreatePayload = {
  errors: Array<{ code: string; message: string | null }>;
  transaction: { id: string; name: string } | null;
};

type CheckoutTransactionsPayload = {
  checkout: {
    transactions: Array<{
      pspReference: string | null;
    }> | null;
  } | null;
};

type CheckoutInitializationStatus = {
  checkoutId: string;
  errors: Array<{ code: string; message: string }>;
  status: "created" | "failed" | "skipped_existing";
};

const buildIdempotencyKey = (
  checkouts: { amount: number; checkoutId: string; currency: string }[],
) => {
  const canonical = [...checkouts]
    .sort((a, b) => a.checkoutId.localeCompare(b.checkoutId))
    .map((checkout) => ({
      checkoutId: checkout.checkoutId,
      amount: checkout.amount,
      currency: checkout.currency.toUpperCase(),
    }));

  const hash = createHash("sha256")
    .update(JSON.stringify(canonical), "utf8")
    .digest("hex");

  return `pi-${hash}`;
};

export async function POST(request: NextRequest) {
  const saleorDomain = request.headers.get("x-saleor-domain");

  if (!saleorDomain) {
    return NextResponse.json(
      { error: "Missing x-saleor-domain header" },
      { status: 400 },
    );
  }

  const bodyParsed = bodySchema.safeParse(await request.json());

  if (!bodyParsed.success) {
    return NextResponse.json(
      { error: "Invalid body", details: bodyParsed.error.flatten() },
      { status: 400 },
    );
  }

  const { checkouts, buyerId } = bodyParsed.data;
  const currencies = Array.from(
    new Set(checkouts.map((checkout) => checkout.currency.toUpperCase())),
  );

  if (currencies.length > 1) {
    return NextResponse.json(
      {
        error: "Checkouts use mixed currencies.",
      },
      { status: 422 },
    );
  }

  const config = await getAppConfig(saleorDomain);

  if (!config) {
    return NextResponse.json(
      {
        error: `Missing app config for domain ${saleorDomain}`,
      },
      { status: 404 },
    );
  }

  const currency = currencies[0];

  if (!currency) {
    return NextResponse.json(
      {
        error: "Unable to determine checkout currency.",
      },
      { status: 422 },
    );
  }
  const amount = checkouts.reduce(
    (sum, item) =>
      sum +
      getCentsFromAmount({ amount: item.amount, currency: item.currency }),
    0,
  );
  const transferGroup = `tg_${Date.now()}_${randomUUID()}`;

  try {
    const stripe = getStripeClient();
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: currency.toLowerCase(),
      automatic_payment_methods: { enabled: true },
      transfer_group: transferGroup,
      idempotencyKey: buildIdempotencyKey(checkouts),
      metadata: {
        subcheckouts: JSON.stringify(checkouts.map((item) => item.checkoutId)),
        checkout_amounts: JSON.stringify(
          Object.fromEntries(
            checkouts.map((item) => [item.checkoutId, item.amount]),
          ),
        ),
        saleor_domain: saleorDomain,
        buyer_id: buyerId ?? "",
        marketplace_model: "separate_charges_transfers",
      },
    });

    if (!paymentIntent.client_secret) {
      marketplaceLogger.error("PaymentIntent created without client secret", {
        paymentIntentId: paymentIntent.id,
        saleorDomain,
      });

      return NextResponse.json(
        {
          error: "Missing client secret for created PaymentIntent.",
          paymentIntentId: paymentIntent.id,
        },
        { status: 500 },
      );
    }

    const token = await getServerAuthToken();
    const checkoutStatuses: CheckoutInitializationStatus[] = [];
    const checkoutsToCreate: typeof checkouts = [];

    const checkoutTransactionsSettled = await Promise.allSettled(
      checkouts.map((checkout) =>
        transactionsService.getCheckoutTransactions(
          { id: checkout.checkoutId },
          token,
        ),
      ),
    );

    checkoutTransactionsSettled.forEach((entry, index) => {
      const checkout = checkouts[index];

      if (!checkout) {
        return;
      }

      const checkoutId = checkout.checkoutId;

      if (entry.status === "rejected") {
        const message =
          entry.reason instanceof Error
            ? entry.reason.message
            : "checkout transactions request failed.";
        const errors = [{ code: "REQUEST_FAILED", message }];

        marketplaceLogger.error(
          "Failed to read checkout transactions before transactionCreate",
          {
            checkoutId,
            paymentIntentId: paymentIntent.id,
            saleorDomain,
            errors,
          },
        );

        checkoutStatuses.push({
          checkoutId,
          errors,
          status: "failed",
        });

        return;
      }

      if (!entry.value.ok) {
        const errors = entry.value.errors.map((error) => ({
          code: error.code,
          message: error.message ?? "checkout transactions request failed.",
        }));

        marketplaceLogger.error(
          "Checkout transactions query returned application errors",
          {
            checkoutId,
            paymentIntentId: paymentIntent.id,
            saleorDomain,
            errors,
          },
        );

        checkoutStatuses.push({
          checkoutId,
          errors,
          status: "failed",
        });

        return;
      }

      const checkoutTransactionsData =
        entry.value.data as CheckoutTransactionsPayload;
      const hasExistingTransaction =
        checkoutTransactionsData.checkout?.transactions?.some(
          (transaction) => transaction.pspReference === paymentIntent.id,
        ) ?? false;

      if (hasExistingTransaction) {
        marketplaceLogger.warning(
          "Skipping transactionCreate for checkout because transaction already exists.",
          {
            checkoutId,
            paymentIntentId: paymentIntent.id,
            saleorDomain,
          },
        );

        checkoutStatuses.push({
          checkoutId,
          errors: [],
          status: "skipped_existing",
        });

        return;
      }

      checkoutsToCreate.push(checkout);
    });

    const transactionCreateSettled = await Promise.allSettled(
      checkoutsToCreate.map((checkout) => {
        const transactionVariables: TransactionCreateVariables = {
          id: checkout.checkoutId,
          transaction: {
            name: "PaymentIntent created",
            amountAuthorized: {
              amount: checkout.amount,
              currency: checkout.currency.toUpperCase(),
            },
            pspReference: paymentIntent.id,
          },
          transactionEvent: {
            pspReference: paymentIntent.id,
            message: "Waiting for customer action",
          },
        };

        return transactionsService.createTransaction(
          transactionVariables,
          token,
        );
      }),
    );

    const failedTransactionCreates: FailedTransactionCreate[] = [];

    transactionCreateSettled.forEach((entry, index) => {
      const checkoutId = checkoutsToCreate[index]?.checkoutId;

      if (!checkoutId) {
        return;
      }

      if (entry.status === "rejected") {
        const errors = [
          {
            code: "REQUEST_FAILED",
            message:
              entry.reason instanceof Error
                ? entry.reason.message
                : "transactionCreate failed.",
          },
        ];

        marketplaceLogger.error("transactionCreate request failed", {
          checkoutId,
          paymentIntentId: paymentIntent.id,
          saleorDomain,
          errors,
        });

        failedTransactionCreates.push({ checkoutId, errors });
        checkoutStatuses.push({
          checkoutId,
          errors,
          status: "failed",
        });

        return;
      }

      if (!entry.value.ok) {
        const errors = entry.value.errors.map((error) => ({
          code: error.code,
          message: error.message ?? "transactionCreate failed.",
        }));

        marketplaceLogger.error(
          "transactionCreate returned application errors",
          {
            checkoutId,
            paymentIntentId: paymentIntent.id,
            saleorDomain,
            errors,
          },
        );

        failedTransactionCreates.push({ checkoutId, errors });
        checkoutStatuses.push({
          checkoutId,
          errors,
          status: "failed",
        });

        return;
      }

      const transactionCreateResultData = entry.value.data as
        | TransactionCreatePayload
        | { transactionCreate: TransactionCreatePayload | null };
      const transactionCreateResult =
        "transactionCreate" in transactionCreateResultData
          ? transactionCreateResultData.transactionCreate
          : transactionCreateResultData;

      if (
        !transactionCreateResult?.transaction ||
        transactionCreateResult.errors.length > 0
      ) {
        const mappedErrors = transactionCreateResult?.errors.map((error) => ({
          code: error.code,
          message: error.message ?? "Unknown transactionCreate error.",
        }));
        const errors =
          mappedErrors && mappedErrors.length > 0
            ? mappedErrors
            : [
                {
                  code: "UNKNOWN_TRANSACTION_CREATE_ERROR",
                  message:
                    "transactionCreate returned no transaction and no error details.",
                },
              ];

        marketplaceLogger.error("transactionCreate returned invalid payload", {
          checkoutId,
          paymentIntentId: paymentIntent.id,
          saleorDomain,
          errors,
        });

        failedTransactionCreates.push({ checkoutId, errors });
        checkoutStatuses.push({
          checkoutId,
          errors,
          status: "failed",
        });

        return;
      }

      marketplaceLogger.warning("transactionCreate succeeded for checkout", {
        checkoutId,
        paymentIntentId: paymentIntent.id,
        saleorDomain,
      });

      checkoutStatuses.push({
        checkoutId,
        errors: [],
        status: "created",
      });
    });

    const hasFailures = failedTransactionCreates.length > 0;

    if (hasFailures) {
      marketplaceLogger.error(
        "Payment intent initialized with transactionCreate failures",
        {
          paymentIntentId: paymentIntent.id,
          saleorDomain,
          failedTransactionCreates,
        },
      );
    }

    return NextResponse.json(
      {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        transferGroup,
        currency: currency.toLowerCase(),
        amount,
        checkouts,
        checkoutStatuses,
        failedTransactionCreates,
        hasFailures,
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to create Stripe PaymentIntent",
        details:
          error instanceof Error ? { message: error.message } : undefined,
      },
      { status: 500 },
    );
  }
}
