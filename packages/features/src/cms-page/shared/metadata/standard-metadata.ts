import type { Metadata } from "next";

import { GenerateStandardCMSPageMetadataProps } from "../types";

/**
 * Generates metadata for the CMS page.
 * @param props - The properties for generating metadata.
 * @returns Metadata object containing title for the CMS page.
 */
export async function generateStandardCMSPageMetadata(
    props: GenerateStandardCMSPageMetadataProps,
): Promise<Metadata> {
    const { slug } = await props.params;

    const resultPage = await props.services.cms.cmsPageGet({
        languageCode: props.services.region.language.code,
        slug,
        options: {
            next: {
                tags: [`CMS:${slug}`],
                revalidate: props.services.config.cacheTTL.cms,
            },
        },
    });

    return {
        title: resultPage?.data?.title || "Page",
    };
}

