import { authMiddleware } from "@/middlewares/authMiddleware";
import { chain } from "@/middlewares/chain";
import { i18nMiddleware } from "@/middlewares/i18nMiddleware";

export default chain([i18nMiddleware, authMiddleware]);

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
