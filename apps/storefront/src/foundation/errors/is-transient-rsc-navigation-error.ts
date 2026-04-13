/**
 * Next.js / React may throw when an RSC Flight fetch is aborted by navigation
 * (e.g. Stripe return_url redirect). Not a user-facing failure — order can still succeed.
 */
export function isTransientRscNavigationError(error: unknown): boolean {
  return (
    error instanceof Error &&
    (error.message === "Error in input stream" ||
      error.message.includes("Error in input stream"))
  );
}
