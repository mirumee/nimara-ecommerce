import { responseError } from "@/lib/api/response-error";
import { getAppConfig } from "@/lib/saleor/app-config";
import { getOrderTransactions, transactionCreate } from "@/lib/saleor/client";
import { verifyStripeWebhookSignature } from "@/lib/stripe/webhook-signature";
import { CONFIG } from "@/config";

type StripePaymentIntentSucceededEvent = {
  data?: {
    object?: {
      currency?: string;
      id?: string;
      metadata?: {
        order_amounts?: string;
        suborders?: string;
      };
    };
  };
  id?: string;
  type?: string;
};

export async function POST(request: Request) {
  const stripeSignature = request.headers.get("stripe-signature");

  if (!stripeSignature) {
    return responseError({
      error: "Missing stripe-signature header.",
      status: 400,
    });
  }

  const rawPayload = await request.text();

  const isValidSignature = verifyStripeWebhookSignature({
    payload: rawPayload,
    stripeSignature,
  });

  if (!isValidSignature) {
    return responseError({
      error: "Invalid Stripe webhook signature.",
      status: 400,
    });
  }

  let event: StripePaymentIntentSucceededEvent;

  try {
    event = JSON.parse(rawPayload) as StripePaymentIntentSucceededEvent;
  } catch {
    return responseError({
      error: "Invalid Stripe payload.",
      status: 400,
    });
  }

  if (event.type !== "payment_intent.succeeded") {
    return Response.json({ status: "skipped" });
  }

  const paymentIntent = event.data?.object;
  const paymentIntentId = paymentIntent?.id;
  const currency = paymentIntent?.currency?.toUpperCase();
  const suborders = paymentIntent?.metadata?.suborders;
  const orderAmountsRaw = paymentIntent?.metadata?.order_amounts;

  if (!paymentIntentId || !currency || !suborders || !orderAmountsRaw) {
    return responseError({
      error: "Missing required PaymentIntent metadata.",
      status: 500,
    });
  }

  let orderIds: string[];
  let orderAmounts: Record<string, number>;

  try {
    const parsedOrderIds = JSON.parse(suborders) as unknown;
    const parsedOrderAmounts = JSON.parse(orderAmountsRaw) as unknown;

    if (!Array.isArray(parsedOrderIds)) {
      throw new Error("suborders should be an array");
    }

    orderIds = parsedOrderIds.map((id) => String(id));

    if (
      typeof parsedOrderAmounts !== "object" ||
      parsedOrderAmounts === null ||
      Array.isArray(parsedOrderAmounts)
    ) {
      throw new Error("order_amounts should be an object");
    }

    orderAmounts = Object.fromEntries(
      Object.entries(parsedOrderAmounts).map(([orderId, amount]) => [
        orderId,
        Number(amount),
      ]),
    );
  } catch {
    return responseError({
      error: "Invalid PaymentIntent metadata payload.",
      status: 500,
    });
  }

  const invalidOrderAmount = orderIds.find((orderId) => {
    const amount = orderAmounts[orderId];
    return !Number.isFinite(amount);
  });

  if (invalidOrderAmount) {
    return responseError({
      error: `Missing/invalid order amount for ${invalidOrderAmount}.`,
      status: 500,
    });
  }

  const config = await getAppConfig(CONFIG.SALEOR_DOMAIN);

  if (!config) {
    return responseError({
      error: `Missing app config for domain ${CONFIG.SALEOR_DOMAIN}`,
      status: 500,
    });
  }

  const settled = await Promise.allSettled(
    orderIds.map(async (orderId) => {
      const amount = orderAmounts[orderId];
      const orderTransactions = await getOrderTransactions({
        saleorApiUrl: CONFIG.SALEOR_API_URL,
        authToken: config.authToken,
        orderId,
      });

      const alreadyCharged = orderTransactions.some((transaction) => {
        if (transaction.pspReference !== paymentIntentId) {
          return false;
        }

        return (transaction.chargedAmount?.amount ?? 0) > 0;
      });

      if (alreadyCharged) {
        return {
          transaction: {
            id: "already-processed",
            name: "PaymentIntent Succeeded",
          },
          errors: [],
        };
      }

      return transactionCreate({
        saleorApiUrl: CONFIG.SALEOR_API_URL,
        authToken: config.authToken,
        id: orderId,
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
      });
    }),
  );

  const failed: Array<{
    errors: Array<{ code: string; message: string }>;
    orderId: string;
  }> = [];

  settled.forEach((entry, index) => {
    const orderId = orderIds[index]!;

    if (entry.status === "rejected") {
      failed.push({
        orderId,
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
      failed.push({
        orderId,
        errors: entry.value.errors.map((error) => ({
          code: error.code,
          message: error.message ?? "Unknown transactionCreate error.",
        })),
      });
    }
  });

  if (failed.length > 0) {
    return Response.json(
      {
        error: "Failed to create transaction for one or more orders.",
        paymentIntentId,
        failed,
      },
      { status: 500 },
    );
  }

  return Response.json({ status: "processed", paymentIntentId });
}
