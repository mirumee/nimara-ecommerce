import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { verifySaleorWebhookSignature } from "@/lib/saleor/webhook-signature";
import { getStripeClient } from "@/lib/stripe/client";
import { getAmountFromCents, getCentsFromAmount } from "@/lib/stripe/currency";
import { marketplaceLogger } from "@/services/logging";

const refundEventSchema = z.object({
  action: z.object({
    actionType: z.literal("REFUND"),
    amount: z.number().positive(),
  }),
  transaction: z.object({
    id: z.string().min(1),
    pspReference: z.string().min(1),
    sourceObject: z.object({
      total: z.object({
        gross: z.object({
          currency: z.string().length(3),
        }),
      }),
    }),
  }),
});

const bodySchema = z.union([
  refundEventSchema,
  z.object({
    event: refundEventSchema,
  }),
]);

const getRefundDashboardUrl = ({ refundId }: { refundId: string }) => {
  const prefix = process.env.STRIPE_SECRET_KEY?.includes("test") ? "test/" : "";

  return `https://dashboard.stripe.com/${prefix}refunds/${refundId}`;
};

const mapStripeRefundStatusToSaleorResult = (status: string) => {
  if (status === "succeeded") {
    return "REFUND_SUCCESS";
  }

  if (status === "pending" || status === "requires_action") {
    return "REFUND_REQUEST";
  }

  if (status === "failed" || status === "canceled") {
    return "REFUND_FAILURE";
  }

  throw new Error(`Unsupported Stripe refund status: ${status}.`);
};

const responseError = ({
  error,
  details,
  status,
}: {
  details?: unknown;
  error: string;
  status: number;
}) =>
  NextResponse.json(details ? { error, details } : { error }, {
    status,
  });

export async function POST(request: NextRequest) {
  const rawPayload = await request.text();
  const verificationResult = await verifySaleorWebhookSignature({
    headers: request.headers,
    payload: rawPayload,
  });

  if (!verificationResult.success) {
    marketplaceLogger.warning(
      "Saleor refund webhook signature verification failed.",
      {
        details: verificationResult.details,
      },
    );

    return responseError({
      error: verificationResult.error,
      details: verificationResult.details,
      status: 400,
    });
  }

  let bodyUnknown: unknown;

  try {
    bodyUnknown = JSON.parse(rawPayload);
  } catch {
    return responseError({
      error: "Invalid Saleor webhook payload.",
      status: 400,
    });
  }

  const bodyParsed = bodySchema.safeParse(bodyUnknown);

  if (!bodyParsed.success) {
    marketplaceLogger.warning("Invalid Saleor refund webhook payload.", {
      details: bodyParsed.error.flatten(),
    });

    return responseError({
      error: "Invalid Saleor refund webhook payload.",
      details: bodyParsed.error.flatten(),
      status: 422,
    });
  }

  const event =
    "event" in bodyParsed.data ? bodyParsed.data.event : bodyParsed.data;
  const currency =
    event.transaction.sourceObject.total.gross.currency.toUpperCase();
  const amountInMinorUnits = getCentsFromAmount({
    amount: event.action.amount,
    currency,
  });

  const stripe = getStripeClient();
  const idempotencyKey = `refund-${event.transaction.id}-${amountInMinorUnits}`;

  try {
    const refund = await stripe.refunds.create({
      payment_intent: event.transaction.pspReference,
      amount: amountInMinorUnits,
      idempotencyKey,
      metadata: {
        saleor_transaction_id: event.transaction.id,
      },
    });

    const responseBody = {
      pspReference: refund.id,
      result: mapStripeRefundStatusToSaleorResult(refund.status),
      amount: getAmountFromCents({
        amount: refund.amount,
        currency: refund.currency.toUpperCase(),
      }),
      message: refund.failure_reason,
      externalUrl: getRefundDashboardUrl({ refundId: refund.id }),
    };

    return NextResponse.json(responseBody);
  } catch (error) {
    marketplaceLogger.error("Failed to process Stripe refund webhook.", {
      error: error instanceof Error ? error.message : "Unknown error",
      saleorTransactionId: event.transaction.id,
      stripePaymentIntentId: event.transaction.pspReference,
    });

    return responseError({
      error: "Failed to process Stripe refund.",
      details: error instanceof Error ? { message: error.message } : undefined,
      status: 500,
    });
  }
}
