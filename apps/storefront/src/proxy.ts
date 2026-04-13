import { chain } from "@nimara/foundation/middleware/chain";

import { authMiddleware } from "@/foundation/auth/authMiddleware";
import { orderPlacedCleanupMiddleware } from "@/foundation/checkout/order-placed-cleanup-middleware";
import { i18nMiddleware } from "@/foundation/i18n/middleware";

export default chain([
  orderPlacedCleanupMiddleware,
  i18nMiddleware,
  authMiddleware,
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
     */
    "/((?!api|_next|_vercel|monitoring|favicon.ico|sitemap.xml|robots.txt|.*\\..*).*)",
  ],
};
