import { authMiddleware } from "@/middlewares/authMiddleware";
import { chain } from "@/middlewares/chain";
import { i18nMiddleware } from "@/middlewares/i18nMiddleware";

export default chain([i18nMiddleware, authMiddleware]);

export const config = {
  // Skip all paths that should not be internationalized.
  matcher: ["/((?!api|_next|_vercel|monitoring|.*\\..*).*)"],
};
