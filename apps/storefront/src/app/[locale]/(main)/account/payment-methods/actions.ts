"use server";

import { revalidateLocalizedPath } from "@/foundation/cache/cache";
import { getCurrentRegion } from "@/foundation/regions";
import { paths } from "@/foundation/routing/paths";
import { getServiceRegistry } from "@/services/registry";
import { getAccessToken } from "@/services/tokens";

const getPaymentContext = async () => {
  const [services, region, accessToken] = await Promise.all([
    getServiceRegistry(),
    getCurrentRegion(),
    getAccessToken(),
  ]);

  return {
    accessToken: accessToken ?? "",
    channel: region.market.channel,
    paymentService: await services.getPaymentService(),
  };
};

export const paymentMethodDeleteAction = async ({ id }: { id: string }) => {
  const { accessToken, channel, paymentService } = await getPaymentContext();
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
  const { accessToken, channel, paymentService } = await getPaymentContext();

  return paymentService.methodInitialize({ accessToken, channel });
};

export const paymentMethodProcessAction = async ({
  id,
  setAsDefault,
}: {
  id: string;
  setAsDefault?: boolean;
}) => {
  const { accessToken, channel, paymentService } = await getPaymentContext();
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
