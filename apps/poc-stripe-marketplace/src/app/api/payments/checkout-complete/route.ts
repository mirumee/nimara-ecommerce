import { z } from "zod";

import { CONFIG } from "@/config";
import { responseError } from "@/lib/api/response-error";
import { getAppConfig } from "@/lib/saleor/app-config";
import { checkoutComplete, orderCancel } from "@/lib/saleor/client";

const bodySchema = z
  .object({
    checkoutIds: z.array(z.string().min(1)).min(1),
  })
  .superRefine((data, ctx) => {
    const uniqueIds = new Set(data.checkoutIds);

    if (uniqueIds.size !== data.checkoutIds.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["checkoutIds"],
        message: "checkoutIds must be unique.",
      });
    }
  });

type CompletedOrder = {
  amount: number;
  currency: string;
  orderId: string;
  orderNumber: string;
  sourceCheckoutId: string;
};

type FailedCheckout = {
  checkoutId: string;
  code: string;
  message: string;
};

type RolledBackOrder = {
  orderId: string;
  sourceCheckoutId: string;
};

type RollbackFailure = {
  code: string;
  message: string;
  orderId: string;
  sourceCheckoutId: string;
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

  const config = await getAppConfig(CONFIG.SALEOR_DOMAIN);

  if (!config) {
    return responseError({
      error: `Missing app config for domain ${CONFIG.SALEOR_DOMAIN}`,
      status: 404,
    });
  }

  const settled = await Promise.allSettled(
    bodyParsed.data.checkoutIds.map(async (checkoutId) => {
      const result = await checkoutComplete({
        saleorApiUrl: CONFIG.SALEOR_API_URL,
        authToken: config.authToken,
        checkoutId,
      });

      return { checkoutId, result };
    }),
  );

  const completedOrders: CompletedOrder[] = [];
  const failedCheckouts: FailedCheckout[] = [];

  settled.forEach((entry, index) => {
    const checkoutId = bodyParsed.data.checkoutIds[index];

    if (entry.status === "rejected") {
      failedCheckouts.push({
        checkoutId,
        code: "REQUEST_FAILED",
        message:
          entry.reason instanceof Error
            ? entry.reason.message
            : "Checkout completion failed.",
      });

      return;
    }

    const { result } = entry.value;

    if (!result.order || result.errors.length > 0) {
      if (result.errors.length > 0) {
        result.errors.forEach((error) => {
          failedCheckouts.push({
            checkoutId,
            code: error.code,
            message: error.message ?? "Unknown checkoutComplete error.",
          });
        });
      } else {
        failedCheckouts.push({
          checkoutId,
          code: "ORDER_NOT_CREATED",
          message: "checkoutComplete finished without creating order.",
        });
      }

      return;
    }

    completedOrders.push({
      sourceCheckoutId: checkoutId,
      orderId: result.order.id,
      orderNumber: result.order.number,
      amount: result.order.total.gross.amount,
      currency: result.order.total.gross.currency,
    });
  });

  if (failedCheckouts.length > 0 && completedOrders.length > 0) {
    const rollbackSettled = await Promise.allSettled(
      completedOrders.map(async (order) => {
        const result = await orderCancel({
          saleorApiUrl: CONFIG.SALEOR_API_URL,
          authToken: config.authToken,
          orderId: order.orderId,
        });

        return {
          order,
          result,
        };
      }),
    );

    const rolledBackOrders: RolledBackOrder[] = [];
    const rollbackFailures: RollbackFailure[] = [];

    rollbackSettled.forEach((entry, index) => {
      const order = completedOrders[index];

      if (entry.status === "rejected") {
        rollbackFailures.push({
          orderId: order.orderId,
          sourceCheckoutId: order.sourceCheckoutId,
          code: "REQUEST_FAILED",
          message:
            entry.reason instanceof Error
              ? entry.reason.message
              : "Order rollback request failed.",
        });

        return;
      }

      const { result } = entry.value;

      if (!result.order || result.errors.length > 0) {
        if (result.errors.length > 0) {
          result.errors.forEach((error) => {
            rollbackFailures.push({
              orderId: order.orderId,
              sourceCheckoutId: order.sourceCheckoutId,
              code: error.code,
              message: error.message ?? "Unknown orderCancel error.",
            });
          });
        } else {
          rollbackFailures.push({
            orderId: order.orderId,
            sourceCheckoutId: order.sourceCheckoutId,
            code: "ORDER_NOT_CANCELLED",
            message: "orderCancel finished without order payload.",
          });
        }

        return;
      }

      rolledBackOrders.push({
        orderId: order.orderId,
        sourceCheckoutId: order.sourceCheckoutId,
      });
    });

    return Response.json(
      {
        completedOrders,
        failedCheckouts,
        rolledBackOrders,
        rollbackFailures,
      },
      { status: 409 },
    );
  }

  if (!completedOrders.length) {
    return Response.json(
      {
        completedOrders,
        failedCheckouts,
        rolledBackOrders: [],
        rollbackFailures: [],
      },
      { status: 409 },
    );
  }

  return Response.json({
    completedOrders,
    failedCheckouts,
  });
}
