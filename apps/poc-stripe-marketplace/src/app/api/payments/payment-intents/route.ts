import { createHash, randomUUID } from "crypto";

import { z } from "zod";

import { CONFIG } from "@/config";
import { responseError } from "@/lib/api/response-error";
import { getAppConfig } from "@/lib/saleor/app-config";
import { transactionCreate } from "@/lib/saleor/client";
import { getCentsFromAmount } from "@/lib/stripe/currency";
import { getStripeClient } from "@/lib/stripe/client";

const bodySchema = z
  .object({
    buyerId: z.string().optional(),
    orders: z
      .array(
        z.object({
          orderId: z.string().min(1),
          amount: z.number().positive(),
          currency: z.string().length(3),
        }),
      )
      .min(1),
  })
  .superRefine((data, ctx) => {
    const uniqueIds = new Set(data.orders.map((order) => order.orderId));

    if (uniqueIds.size !== data.orders.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["orders"],
        message: "orderId must be unique in orders array.",
      });
    }
  });

type FailedTransactionCreate = {
  errors: Array<{ code: string; message: string }>;
  orderId: string;
};

const buildIdempotencyKey = (orders: { amount: number; currency: string; orderId: string }[]) => {
  const canonical = [...orders]
    .sort((a, b) => a.orderId.localeCompare(b.orderId))
    .map((order) => ({
      orderId: order.orderId,
      amount: order.amount,
      currency: order.currency.toUpperCase(),
    }));

  const hash = createHash("sha256")
    .update(JSON.stringify(canonical), "utf8")
    .digest("hex");

  return `pi-${hash}`;
};

export async function POST(request: Request) {
  const bodyParsed = bodySchema.safeParse(await request.json());

  if (!bodyParsed.success) {
    return responseError({
      error: "Invalid body",
      details: bodyParsed.error.flatten(),
      status: 400,
    });
  }

  const { orders, buyerId } = bodyParsed.data;
  const currencies = Array.from(
    new Set(orders.map((order) => order.currency.toUpperCase())),
  );

  if (currencies.length > 1) {
    return Response.json(
      {
        error: "Orders use mixed currencies.",
      },
      { status: 422 },
    );
  }

  const config = await getAppConfig(CONFIG.SALEOR_DOMAIN);

  if (!config) {
    return responseError({
      error: `Missing app config for domain ${CONFIG.SALEOR_DOMAIN}`,
      status: 404,
    });
  }

  const currency = currencies[0]!;
  const amount = orders.reduce(
    (sum, item) =>
      sum + getCentsFromAmount({ amount: item.amount, currency: item.currency }),
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
      idempotencyKey: buildIdempotencyKey(orders),
      metadata: {
        suborders: JSON.stringify(orders.map((item) => item.orderId)),
        order_amounts: JSON.stringify(
          Object.fromEntries(orders.map((item) => [item.orderId, item.amount])),
        ),
        buyer_id: buyerId ?? "",
        marketplace_model: "separate_charges_transfers",
        env: CONFIG.ENVIRONMENT,
      },
    });

    if (!paymentIntent.client_secret) {
      return responseError({
        error: "Stripe did not return client secret.",
        status: 500,
      });
    }

    const transactionCreateSettled = await Promise.allSettled(
      orders.map((item) =>
        transactionCreate({
          saleorApiUrl: CONFIG.SALEOR_API_URL,
          authToken: config.authToken,
          id: item.orderId,
          transaction: {
            name: "PaymentIntent created",
            amountAuthorized: {
              amount: item.amount,
              currency: item.currency.toUpperCase(),
            },
            pspReference: paymentIntent.id,
          },
          transactionEvent: {
            pspReference: paymentIntent.id,
            message: "Waiting for customer action",
          },
        }),
      ),
    );

    const failedTransactionCreates: FailedTransactionCreate[] = [];

    transactionCreateSettled.forEach((entry, index) => {
      const orderId = orders[index]!.orderId;

      if (entry.status === "rejected") {
        failedTransactionCreates.push({
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
        failedTransactionCreates.push({
          orderId,
          errors: entry.value.errors.map((error) => ({
            code: error.code,
            message: error.message ?? "Unknown transactionCreate error.",
          })),
        });
      }
    });

    if (failedTransactionCreates.length > 0) {
      return Response.json(
        {
          error: "Failed to create transaction for one or more orders.",
          paymentIntentId: paymentIntent.id,
          transferGroup,
          failedTransactionCreates,
        },
        { status: 500 },
      );
    }

    return Response.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      transferGroup,
      currency: currency.toLowerCase(),
      amount,
      orders,
    });
  } catch (error) {
    return responseError({
      error: "Failed to create Stripe PaymentIntent",
      details: error instanceof Error ? { message: error.message } : undefined,
      status: 500,
    });
  }
}
