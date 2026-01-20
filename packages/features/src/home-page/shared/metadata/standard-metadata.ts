import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { type StandardHomeViewProps } from "../types";

/**
 * Generates metadata for the home page.
 * @param props - The properties for generating metadata.
 * @returns Metadata object containing title and description for the home page.
 */
export async function generateStandardHomeMetadata({
  storefrontUrl,
}: Pick<StandardHomeViewProps, "storefrontUrl">): Promise<Metadata> {
  const t = await getTranslations("home");

  const url = new URL(storefrontUrl);
  const canonicalUrl = url.toString();

  return {
    title: t("title"),
    description: t("description"),
    openGraph: {
      images: [
        {
          url: "/og-hp.png",
          width: 1200,
          height: 630,
          alt: t("homepage-preview"),
        },
      ],
      url: canonicalUrl,
      siteName: "Nimara Store",
    },
  };
}
