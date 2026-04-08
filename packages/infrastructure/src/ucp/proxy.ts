import { redirect } from "next/navigation";
import {
  type NextFetchEvent,
  type NextRequest,
  NextResponse,
} from "next/server";

import { type CustomMiddleware } from "@nimara/foundation/middleware/chain";

import { type Logger } from "#root/logging/types";

export interface UcpProxyConfig {
  checkoutCookie: {
    [key: string]: unknown;
    key: string;
    maxAge: number;
  };
  logger: Logger;
  redirectEnabled: boolean;
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
    redirectEnabled,
    logger,
  }: UcpProxyConfig) =>
  (next: CustomMiddleware) =>
  async (
    request: NextRequest,
    event: NextFetchEvent,
    response: NextResponse,
  ) => {
    const url = new URL(request.url);
    const checkoutID = decodeURIComponent(
      url.searchParams.get("checkoutID") ?? "",
    );
    const redirectPath = decodeURIComponent(
      url.searchParams.get("redirectPath") ?? "",
    );

    logger.info("[UCP Proxy] Checkout handoff detected.", {
      context: {
        requestURL: request.url,
        redirectEnabled: redirect,
        redirectPath,
        checkoutID,
      },
    });

    if (checkoutID !== "") {
      if (redirectEnabled && redirectPath) {
        logger.info("[UCP Proxy] Redirecting to provided `redirectPath`.", {
          context: {
            checkoutID,
            redirectPath,
            requestUrl: request.url,
          },
        });

        const redirectResponse = NextResponse.redirect(
          new URL(redirectPath, request.url),
        );

        // Set secure httpOnly cookie for checkout session
        redirectResponse.cookies.set(cookieKey, checkoutID, cookieConfig);

        return redirectResponse;
      }

      if (redirectEnabled && !redirectPath) {
        logger.warning(
          "[UCP Proxy] `redirectPath` query parameter is required when proxy redirect is enabled. Setting cookie and passing through.",
          {
            context: {
              checkoutID,
              redirectPath,
            },
          },
        );
      }

      response.cookies.set(cookieKey, checkoutID, cookieConfig);

      return next(request, event, response);
    }

    logger.warning(
      "[UCP Proxy] No `checkoutID` query parameter provided, passing through.",
      {
        context: {
          checkoutID,
          redirectEnabled,
          redirectPath,
        },
      },
    );

    return next(request, event, response);
  };
