import { responseError } from "@/lib/api/util";
import { isError } from "@/lib/error";
import { getConfigProvider } from "@/providers/config";

import { type PaymentGatewayConfig } from "./schema";

type AppConfigForChannel = {
  authToken: string;
  gatewayConfig: PaymentGatewayConfig[string];
};

export const getAppConfigForChannel = async ({
  channelSlug,
  saleorDomain,
}: {
  channelSlug: string;
  saleorDomain: string;
}): Promise<AppConfigForChannel> => {
  const config = await getConfigProvider({ saleorDomain }).getBySaleorDomain({
    saleorDomain,
  });

  if (!config) {
    throw new Error(`Missing config for ${saleorDomain}.`);
  }

  const gatewayConfig = config.paymentGatewayConfig[channelSlug];

  if (!gatewayConfig) {
    throw new Error(`Missing config for ${saleorDomain} - ${channelSlug}.`);
  }

  return { authToken: config.authToken, gatewayConfig };
};

/**
 * Route-level wrapper: yields the channel configuration, or the response to
 * answer Saleor with when the channel is not configured for this app.
 */
export const resolveAppConfigForChannel = async (opts: {
  channelSlug: string;
  saleorDomain: string;
}): Promise<
  | { config: AppConfigForChannel; response?: never }
  | { config?: never; response: Response }
> => {
  try {
    return { config: await getAppConfigForChannel(opts) };
  } catch (err) {
    return {
      response: responseError({
        description: "Missing gateway configuration for channel.",
        errors: isError(err) ? [{ message: err.message }] : [],
        status: 422,
      }),
    };
  }
};
