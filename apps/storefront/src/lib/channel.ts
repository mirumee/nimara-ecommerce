import { type ACPError } from "@nimara/infrastructure/acp/types";

import { MARKETS } from "@/regions/config";
import { type Market } from "@/regions/types";
import { storefrontLogger } from "@/services/logging";

export const getMarketData = (channelSlug: string): Market | null => {
  const channel = Object.values(MARKETS).find(
    (market) => market.channel === channelSlug,
  );

  if (!channel) {
    return null;
  }

  return channel;
};

/**
 * Middleware to validate channel slug in the request params in the API routes.
 * Takes a channel slug from the request params and checks if it's valid.
 * If valid, it allows the request to proceed. If not, it returns a 400 response.
 * @returns Middleware function
 */
export const validateChannelParam = (
  channelSlug: string,
): { market: Market; ok: true } | { errorResponse: Response; ok: false } => {
  const market = Object.values(MARKETS).find(
    (market) => market.channel === channelSlug,
  );

  if (!market) {
    storefrontLogger.error("Invalid channel slug", {
      channelSlug,
      context: "ACP",
    });

    return {
      ok: false,
      errorResponse: new Response(
        JSON.stringify({
          code: "request_not_idempotent",
          message:
            "Invalid or unsupported channel slug. Please provide a valid channel.",
          type: "invalid_request",
          param: channelSlug,
        } satisfies ACPError),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      ),
    };
  }

  return {
    ok: true,
    market,
  };
};
