import { chain } from "@nimara/foundation/middleware/chain";
import { ucpProxyMiddleware } from "@nimara/infrastructure/ucp/proxy";

import { COOKIE_KEY, COOKIE_MAX_AGE } from "@/config";
import { authMiddleware } from "@/foundation/auth/authMiddleware";
import { i18nMiddleware } from "@/foundation/i18n/middleware";
import { storefrontLogger } from "@/services/logging";

export default chain([
  i18nMiddleware,
  authMiddleware,
  ucpProxyMiddleware({
    redirectEnabled: true,
    checkoutCookie: {
      key: COOKIE_KEY.checkoutId,
      maxAge: COOKIE_MAX_AGE.checkout,
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    },
    logger: storefrontLogger,
  }),
]);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next (static files)
     * - _vercel (deployment files)
     * - monitoring (Sentry "tunnelRoute")
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     * - robots.txt (metadata files)
     * - .well-known
     * - all other files
     */
    "/((?!api|_next|_vercel|monitoring|favicon.ico|sitemap.xml|robots.txt|.well-known|.*\\..*).*)",
  ],
};
