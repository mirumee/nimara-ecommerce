import type { Metadata } from "next";

import { type GenerateStandardSearchMetadataProps } from "../types";

/**
 * Generates metadata for the search page.
 * @param props - The properties for generating metadata.
 * @returns Metadata object containing title and description for the search page.
 */
export async function generateStandardSearchMetadata({
  searchPath,
  storefrontUrl,
  ogImageAlt,
  siteName,
  ...metadata
}: GenerateStandardSearchMetadataProps): Promise<Metadata> {
  const canonicalUrl = new URL(searchPath, storefrontUrl).toString();

  return {
    openGraph: {
      images: [
        {
          url: "/og-hp.png",
          width: 1200,
          height: 630,
          alt: ogImageAlt || "Search preview",
        },
      ],
      url: canonicalUrl,
      siteName: siteName || "Nimara Store",
    },
    alternates: {
      canonical: canonicalUrl,
    },
    ...metadata,
  };
}
