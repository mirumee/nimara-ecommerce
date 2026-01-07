import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { GenerateStandardSearchMetadataProps } from "../types";

/**
 * Generates metadata for the search page.
 * @param props - The properties for generating metadata.
 * @returns Metadata object containing title and description for the search page.
 */
export async function generateStandardSearchMetadata({
    searchParams: searchParamsPromise,
    searchPath,
    storefrontUrl,
}: GenerateStandardSearchMetadataProps): Promise<Metadata> {
    const searchParams = await searchParamsPromise;
    const canonicalUrl = new URL(searchPath, storefrontUrl).toString();

    const t = await getTranslations("search");

    return {
        title: searchParams.q
            ? t("search-for", { query: searchParams.q })
            : t("all-products"),
        description: t("description"),
        openGraph: {
            images: [
                {
                    url: "/og-hp.png",
                    width: 1200,
                    height: 630,
                    alt: t("search-preview"),
                },
            ],
            url: canonicalUrl,
            siteName: "Nimara Store",
        },
        alternates: {
            canonical: canonicalUrl,
        },
    };
}

