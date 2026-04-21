import {
  type NextFetchEvent,
  type NextRequest,
  NextResponse,
} from "next/server";

import { type CustomMiddleware } from "@nimara/foundation/middleware/chain";

import { COOKIE_KEY } from "@/config";

/** Must match `QUERY_PARAMS.orderPlaced` in `@/foundation/routing/paths`. */
const ORDER_PLACED_QUERY = "orderPlaced";

/**
 * After successful payment, users land on order confirmation with `?orderPlaced=true`.
 * Clears checkout cookie and strips the query via redirect on the same pathname.
 * Runs in middleware so cookie mutation is allowed and locale-prefixed URLs stay intact.
 * Skips prefetch to avoid breaking RSC prefetch and spurious cookie deletion.
 */
export function orderPlacedCleanupMiddleware(
  next: CustomMiddleware,
): CustomMiddleware {
  return async (
    request: NextRequest,
    event: NextFetchEvent,
    prevResponse: NextResponse,
  ) => {
    const isPrefetch = request.headers.get("x-nextjs-prefetch") === "1";

    if (
      request.method !== "GET" ||
      isPrefetch ||
      !request.nextUrl.searchParams.has(ORDER_PLACED_QUERY) ||
      !request.nextUrl.pathname.includes("/order/confirmation/")
    ) {
      return next(request, event, prevResponse);
    }

    const url = request.nextUrl.clone();

    url.searchParams.delete(ORDER_PLACED_QUERY);

    const response = NextResponse.redirect(url);

    response.cookies.delete(COOKIE_KEY.checkoutId);

    return response;
  };
}
