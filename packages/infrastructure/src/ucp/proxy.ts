import {
  type NextFetchEvent,
  type NextRequest,
  type NextResponse,
  NextResponse as NextResponseClass,
} from "next/server";

import { type CustomMiddleware } from "@nimara/foundation/middleware/chain";

/**
 * Proxy middleware for UCP Checkout handoff.
 * Checks if the incoming URL contains a checkoutId query parameter.
 * If present:
 *   1. Sets a checkout cookie with the ID
 *   2. Redirects to the checkout page
 * If not present:
 *   - Passes through to the next middleware/route
 * @see https://ucp.dev/draft/specification/checkout/#continue-url
 */
export interface UcpProxyConfig {
  cookieKey: string;
  cookieMaxAge: number;
}

export function ucpProxyMiddleware(config: UcpProxyConfig) {
  return (next: CustomMiddleware) => {
    return async (
      request: NextRequest,
      event: NextFetchEvent,
      response: NextResponse,
    ) => {
      const url = new URL(request.url);
      const checkoutId = url.searchParams.get("checkoutId");

      // If checkoutId is present, redirect to checkout with cookie
      if (checkoutId) {
        const checkoutUrl = new URL("/checkout", request.url);
        checkoutUrl.searchParams.set("id", checkoutId);

        const redirectResponse = NextResponseClass.redirect(checkoutUrl);

        // Set secure httpOnly cookie for checkout session
        redirectResponse.cookies.set(config.cookieKey, checkoutId, {
          path: "/",
          maxAge: config.cookieMaxAge,
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
        });

        return redirectResponse;
      }

      // No checkoutId query parameter, pass through
      return next(request, event, response);
    };
  };
}
