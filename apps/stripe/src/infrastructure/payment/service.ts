import { type AsyncResult, ok } from "@nimara/domain/objects/Result";
import { type Logger } from "@nimara/infrastructure/logging/types";

import { type ChannelGatewayConfig } from "@/domain/app-config";
import { stripeGateway } from "@/infrastructure/payment/stripe/gateway";

/**
 * Resolves a channel's gateway config and returns a gateway bound to its
 * secret key — the per-tenant entry point payment handlers use.
 */
export const paymentService =
  ({
    getGatewayConfig,
    logger,
  }: {
    getGatewayConfig: (opts: {
      channelSlug: string;
      saleorDomain: string;
    }) => AsyncResult<ChannelGatewayConfig>;
    logger: Logger;
  }) =>
  async ({
    channelSlug,
    saleorDomain,
  }: {
    channelSlug: string;
    saleorDomain: string;
  }) => {
    const result = await getGatewayConfig({ channelSlug, saleorDomain });

    if (!result.ok) {
      return result;
    }

    return ok({
      config: result.data,
      gateway: stripeGateway({ secretKey: result.data.secretKey, logger }),
    });
  };
