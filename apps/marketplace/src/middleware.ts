import { type NextRequest , NextResponse } from "next/server";

// Routes that don't require authentication
const publicRoutes = ["/sign-in", "/sign-up", "/account-confirm"];

// API routes that don't require authentication
const publicApiRoutes = [
  "/api/graphql",
  "/api/saleor/manifest",
  "/api/saleor/register",
  "/api/saleor/webhooks",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Allow public API routes
  if (publicApiRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Allow static files
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // For other routes, we let the client-side auth handle it
  // The authenticated layout will redirect to sign-in if needed
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
