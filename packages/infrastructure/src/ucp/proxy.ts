import {
  type NextFetchEvent,
  type NextRequest,
  NextResponse,
} from "next/server";

import { type CustomMiddleware } from "@nimara/foundation/middleware/chain";
import { type Logger } from "#root/logging/types";

export interface UcpProxyConfig {
  logger: Logger;
  checkoutPath: string;
  checkoutCookie: {
    key: string;
    maxAge: number;
    [key: string]: unknown;
  };
}

/**
 * Proxy middleware for handling checkout handoff from UCP.
 * Customer gets here when they cannot complete the checkout process via agentic checkout flow.
 *
 * Requires:
 * - a checkout ID passed as a query parameter (`checkoutId`), for setting a checkout cookie.
 *
 * Optional:
 * - a redirect, relative path used for redirecting the customer to the checkout page.
 *
 * If present:
 *   1. Sets a checkout cookie with the ID.
 *   2. Redirect the customer to the checkout page for completing the checkout.
 *
 * If not present:
 *   - Passes through to the next middleware/route, does nothing.
 *
 * @see https://ucp.dev/draft/specification/checkout/#checkout-permalink
 */
export const ucpProxyMiddleware =
  ({
    checkoutCookie: { key: cookieKey, ...cookieConfig },
    checkoutPath,
    logger,
  }: UcpProxyConfig) =>
  (next: CustomMiddleware) =>
  async (
    request: NextRequest,
    event: NextFetchEvent,
    response: NextResponse,
  ) => {
    const url = new URL(request.url);
    const checkoutID = url.searchParams.get("checkoutID");

    if (checkoutID) {
      const redirectPath = url.searchParams.get("redirectPath") ?? checkoutPath;
      const redirectResponse = NextResponse.redirect(
        new URL(redirectPath, request.url),
      );

      // Set secure httpOnly cookie for checkout session.
      redirectResponse.cookies.set(cookieKey, checkoutID, cookieConfig);

      logger.info("UCP checkout handoff detected", {
        checkoutID,
        redirectPath,
        requestUrl: request.url,
      });

      // Return redirect immediately - don't pass to next() to preserve cookie
      return redirectResponse;
    }

    // No checkoutId or redirectPath provided, pass through, but log an error.
    if (!checkoutID) {
      logger.error("No checkoutId provided from UCP.", {
        requestUrl: request.url,
        nextUrl: request.nextUrl.toString(),
      });
    }

    return next(request, event, response);
  };
