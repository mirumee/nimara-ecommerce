import { cookies } from "next/headers";
import { z } from "zod";

import { type AppErrorCode } from "@nimara/domain/objects/Error";
import { type CartService } from "@nimara/infrastructure/cart/types";

import { COOKIE_KEY, COOKIE_MAX_AGE } from "@/config";
import { serverEnvs } from "@/envs/server";
import {
  checkoutCompleteMarketplace,
  type CheckoutCompleteResponse,
  createMarketplacePaymentIntent,
} from "@/lib/marketplace/poc-payments-client";
import { getCartService } from "@/services/cart";
import { getCheckoutService } from "@/services/checkout";

type CheckoutSnapshot = {
  checkoutId: string;
  email: string | undefined;
  lines: Array<{
    quantity: number;
    variantId: string;
  }>;
};

type PrepareSuccessResponse = {
  clientSecret: string;
  orderIds: string[];
};

type PrepareErrorResponse = {
  errors: Array<{
    code: AppErrorCode;
  }>;
};
type CartLanguageCode = Parameters<CartService["linesAdd"]>[0]["languageCode"];

const requestSchema = z
  .object({
    buyerId: z.string().min(1),
    channel: z.string().min(1),
    checkoutIds: z.array(z.string().min(1)).min(1),
    countryCode: z.string().length(2),
    languageCode: z.string().min(1),
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

const getCookieOptions = () => ({
  path: "/",
  maxAge: COOKIE_MAX_AGE.checkout,
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
});

const parseCheckoutVendorMap = (
  raw: string | undefined,
): Record<string, string> => {
  if (!raw) {
    return {};
  }

  try {
    const parsed = JSON.parse(raw);

    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {};
    }

    return Object.fromEntries(
      Object.entries(parsed).filter(
        ([vendorId, checkoutId]) =>
          !!vendorId &&
          typeof vendorId === "string" &&
          typeof checkoutId === "string" &&
          !!checkoutId,
      ),
    );
  } catch {
    return {};
  }
};

const createErrorResponse = (code: AppErrorCode, status = 409): Response => {
  const body: PrepareErrorResponse = {
    errors: [{ code }],
  };

  return Response.json(body, { status });
};

const snapshotCheckouts = async ({
  checkoutIds,
  countryCode,
  languageCode,
}: {
  checkoutIds: string[];
  countryCode: string;
  languageCode: string;
}) => {
  const checkoutService = await getCheckoutService();
  const snapshots: Record<string, CheckoutSnapshot> = {};

  const settled = await Promise.allSettled(
    checkoutIds.map(async (checkoutId) => {
      const result = await checkoutService.checkoutGet({
        checkoutId,
        languageCode,
        countryCode,
      });

      if (!result.ok) {
        return null;
      }

      const checkout = result.data.checkout;

      return {
        checkoutId,
        email: checkout.email ?? undefined,
        lines: checkout.lines.map((line) => ({
          quantity: line.quantity,
          variantId: line.variant.id,
        })),
      } satisfies CheckoutSnapshot;
    }),
  );

  settled.forEach((entry) => {
    if (entry.status !== "fulfilled" || !entry.value) {
      return;
    }

    snapshots[entry.value.checkoutId] = entry.value;
  });

  return snapshots;
};

const getOrderIdsToRebuild = (result: CheckoutCompleteResponse): string[] => {
  const rollbackOrderIds = new Set(
    (result.rolledBackOrders ?? []).map((order) => order.orderId),
  );
  const useRollbackFilter = rollbackOrderIds.size > 0;

  return [
    ...new Set(
      result.completedOrders
        .filter((order) =>
          useRollbackFilter ? rollbackOrderIds.has(order.orderId) : true,
        )
        .map((order) => order.sourceCheckoutId),
    ),
  ];
};

const rebuildCheckout = async ({
  cartService,
  channel,
  languageCode,
  snapshot,
}: {
  cartService: CartService;
  channel: string;
  languageCode: string;
  snapshot: CheckoutSnapshot;
}) => {
  let cartId: string | null = null;

  for (const line of snapshot.lines) {
    const result = await cartService.linesAdd({
      cartId,
      channel,
      email: snapshot.email,
      languageCode: languageCode as CartLanguageCode,
      lines: [
        {
          quantity: line.quantity,
          variantId: line.variantId,
        },
      ],
    });

    if (!result.ok) {
      return null;
    }

    cartId = result.data.cartId;
  }

  return cartId;
};

const rebuildCheckouts = async ({
  channel,
  languageCode,
  snapshots,
  sourceCheckoutIds,
}: {
  channel: string;
  languageCode: string;
  snapshots: Record<string, CheckoutSnapshot>;
  sourceCheckoutIds: string[];
}) => {
  const cartService = await getCartService();
  const replacedCheckoutIds: Record<string, string> = {};

  for (const sourceCheckoutId of sourceCheckoutIds) {
    const snapshot = snapshots[sourceCheckoutId];

    if (!snapshot || !snapshot.lines.length) {
      continue;
    }

    const rebuiltCheckoutId = await rebuildCheckout({
      cartService,
      channel,
      languageCode,
      snapshot,
    });

    if (!rebuiltCheckoutId) {
      continue;
    }

    replacedCheckoutIds[sourceCheckoutId] = rebuiltCheckoutId;
  }

  return replacedCheckoutIds;
};

const replaceCheckoutIdsInCookieMap = async (
  replacedCheckoutIds: Record<string, string>,
) => {
  if (!Object.keys(replacedCheckoutIds).length) {
    return;
  }

  const cookieStore = await cookies();
  const currentMap = parseCheckoutVendorMap(
    cookieStore.get(COOKIE_KEY.checkoutVendorMap)?.value,
  );

  if (!Object.keys(currentMap).length) {
    return;
  }

  const nextMap = Object.fromEntries(
    Object.entries(currentMap).map(([vendorId, checkoutId]) => [
      vendorId,
      replacedCheckoutIds[checkoutId] ?? checkoutId,
    ]),
  );

  cookieStore.set(
    COOKIE_KEY.checkoutVendorMap,
    JSON.stringify(nextMap),
    getCookieOptions(),
  );

  const primaryCheckoutId = Object.values(nextMap)[0];

  if (primaryCheckoutId) {
    cookieStore.set(
      COOKIE_KEY.checkoutId,
      primaryCheckoutId,
      getCookieOptions(),
    );
  } else {
    cookieStore.delete(COOKIE_KEY.checkoutId);
  }
};

const isPartialCheckoutComplete = (result: CheckoutCompleteResponse) =>
  result.completedOrders.length > 0 && result.failedCheckouts.length > 0;

export async function POST(request: Request) {
  if (!serverEnvs.MARKETPLACE_MODE) {
    return createErrorResponse("CHECKOUT_NOT_FOUND_ERROR", 400);
  }

  const parsedBody = requestSchema.safeParse(await request.json());

  if (!parsedBody.success) {
    return createErrorResponse("BAD_REQUEST_ERROR", 400);
  }

  const { buyerId, checkoutIds, countryCode, languageCode, channel } =
    parsedBody.data;
  const uniqueCheckoutIds = [...new Set(checkoutIds.filter(Boolean))];

  if (!uniqueCheckoutIds.length) {
    return createErrorResponse("CHECKOUT_NOT_FOUND_ERROR", 400);
  }

  try {
    const snapshots = await snapshotCheckouts({
      checkoutIds: uniqueCheckoutIds,
      countryCode,
      languageCode,
    });

    const resultCheckoutComplete =
      await checkoutCompleteMarketplace(uniqueCheckoutIds);
    const checkoutCompleteData = resultCheckoutComplete.data;

    if (
      !resultCheckoutComplete.ok ||
      !checkoutCompleteData.completedOrders.length ||
      checkoutCompleteData.failedCheckouts.length > 0
    ) {
      if (isPartialCheckoutComplete(checkoutCompleteData)) {
        const sourceCheckoutIdsToRebuild =
          getOrderIdsToRebuild(checkoutCompleteData);
        const replacedCheckoutIds = await rebuildCheckouts({
          channel,
          languageCode,
          snapshots,
          sourceCheckoutIds: sourceCheckoutIdsToRebuild,
        });

        await replaceCheckoutIdsInCookieMap(replacedCheckoutIds);
      }

      return createErrorResponse("CHECKOUT_COMPLETE_ERROR", 409);
    }

    const currencies = new Set(
      checkoutCompleteData.completedOrders.map((order) =>
        order.currency.toUpperCase(),
      ),
    );

    if (currencies.size > 1) {
      return createErrorResponse("CHECKOUT_COMPLETE_ERROR", 409);
    }

    const resultPaymentIntent = await createMarketplacePaymentIntent({
      buyerId,
      orders: checkoutCompleteData.completedOrders.map((order) => ({
        orderId: order.orderId,
        amount: order.amount,
        currency: order.currency,
      })),
    });

    if (!resultPaymentIntent.ok || !resultPaymentIntent.data.clientSecret) {
      return createErrorResponse("TRANSACTION_INITIALIZE_ERROR", 500);
    }

    const body: PrepareSuccessResponse = {
      clientSecret: resultPaymentIntent.data.clientSecret,
      orderIds: checkoutCompleteData.completedOrders.map(
        (order) => order.orderId,
      ),
    };

    return Response.json(body);
  } catch {
    return createErrorResponse("CHECKOUT_COMPLETE_ERROR", 409);
  }
}
