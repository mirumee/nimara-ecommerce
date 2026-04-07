/**
 * Builds the public storefront URL for a vendor profile page.
 * Path matches storefront route: /vendor/[vendorSlug] (default locale, no prefix).
 */
export function buildVendorStorefrontUrl(
  storefrontBaseUrl: string,
  opts: { nameFallback: string; slug?: string | null },
): string {
  const segment =
    opts.slug?.trim() ||
    String(opts.nameFallback).toLowerCase().replace(/\s+/g, "-");
  const base = storefrontBaseUrl.replace(/\/$/, "");

  return new URL(`vendor/${segment}`, base).toString();
}
