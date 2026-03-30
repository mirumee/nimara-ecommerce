import "@nimara/ui/styles/globals";

import Link from "next/link";

/**
 * Root-level 404 (outside `[locale]`). Must not call `notFound()` here — that
 * re-enters not-found handling and breaks Next.js performance marks (Turbopack:
 * `NotFoundRedirect` negative timestamp).
 */
export default function RootNotFound() {
  return (
    <html lang="en">
      <body className="flex min-h-dvh flex-col items-center justify-center bg-background px-4 font-sans text-foreground">
        <h1 className="text-4xl font-bold tracking-tight">404</h1>
        <p className="mt-2 text-center text-muted-foreground">
          Page not found.
        </p>
        <Link
          href="/"
          className="mt-8 text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          Back to home
        </Link>
      </body>
    </html>
  );
}
