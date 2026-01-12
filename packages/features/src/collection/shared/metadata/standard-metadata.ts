import type { Metadata } from "next";

import { editorJSDataToString } from "@nimara/ui/lib/richText";

import { type StandardCollectionViewMetadataProps } from "../types";

/**
 * Generates metadata for the collection page.
 * @param props - The properties for generating metadata.
 * @returns Metadata object containing title and description for the collection page.
 */
export async function generateStandardCollectionMetadata(
  props: StandardCollectionViewMetadataProps,
): Promise<Metadata> {
  const { slug } = await props.params;

  const url = new URL(props.collectionPath, props.storefrontUrl);
  const canonicalUrl = url.toString();

  const getCollectionResult =
    await props.services.collection.getCollectionDetails({
      channel: props.services.region.market.channel,
      languageCode: props.services.region.language.code,
      slug,
      limit: props.defaultResultsPerPage,
      options: {
        next: {
          revalidate: props.services.config.cacheTTL.pdp,
          tags: [`COLLECTION:${slug}`, "DETAIL-PAGE:COLLECTION"],
        },
      },
    });

  const collection = getCollectionResult.data?.results;

  if (!collection) {
    return {
      title: "Collection",
      description: "Collection details",
    };
  }

  const rawDescription = collection?.description;
  const parsedDescription = editorJSDataToString(rawDescription)?.trim();
  const ogImageUrl = `${props.storefrontUrl}/collections/${slug}/opengraph-image`;

  return {
    title: collection.seoTitle || collection.name,
    description:
      collection.seoDescription || parsedDescription?.length
        ? parsedDescription?.slice(0, 200)
        : collection.name,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: collection.name,
        },
      ],
      url: canonicalUrl,
      siteName: "Nimara Store",
    },
  };
}
