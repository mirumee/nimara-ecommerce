"use server";

import { ok } from "@nimara/domain/objects/Result";

import { revalidateLocalizedPath } from "@/foundation/cache/cache";
import { getCurrentRegion } from "@/foundation/regions";
import { paths } from "@/foundation/routing/paths";
import { getServiceRegistry } from "@/services/registry";
import { requireAccessToken } from "@/services/tokens";

const getPaymentContext = async () => {
  const [services, region, resultAccessToken] = await Promise.all([
    getServiceRegistry(),
    getCurrentRegion(),
    requireAccessToken(),
  ]);

  if (!resultAccessToken.ok) {
    return resultAccessToken;
  }

  return ok({
    accessToken: resultAccessToken.data,
    channel: region.market.channel,
    paymentService: await services.getPaymentService(),
  });
};

export const paymentMethodDeleteAction = async ({ id }: { id: string }) => {
  const context = await getPaymentContext();

  if (!context.ok) {
    return context;
  }

  const { accessToken, channel, paymentService } = context.data;
  const result = await paymentService.methodDelete({
    accessToken,
    channel,
    id,
  });

  if (result.ok) {
    await revalidateLocalizedPath(paths.account.paymentMethods.asPath());
  }

  return result;
};

export const paymentMethodInitializeAction = async () => {
  const context = await getPaymentContext();

  if (!context.ok) {
    return context;
  }

  const { accessToken, channel, paymentService } = context.data;

  return paymentService.methodInitialize({ accessToken, channel });
};

export const paymentMethodProcessAction = async ({
  id,
  setAsDefault,
}: {
  id: string;
  setAsDefault?: boolean;
}) => {
  const context = await getPaymentContext();

  if (!context.ok) {
    return context;
  }

  const { accessToken, channel, paymentService } = context.data;
  const result = await paymentService.methodProcess({
    accessToken,
    channel,
    data: { setAsDefault },
    id,
  });

  if (result.ok) {
    await revalidateLocalizedPath(paths.account.paymentMethods.asPath());
  }

  return result;
};
