import type { Metadata } from "next";

import { editorJSDataToString } from "@nimara/ui/lib/richText";

import { type StandardCategoryViewMetadataProps } from "../types";

/**
 * Generates metadata for the category page.
 * @param props - The properties for generating metadata.
 * @returns Metadata object containing title and description for the category page.
 */
export async function generateStandardCategoryMetadata(
  props: StandardCategoryViewMetadataProps,
): Promise<Metadata> {
  const { slug } = await props.params;

  const url = new URL(props.categoryPath, props.storefrontUrl);
  const canonicalUrl = url.toString();

  const categoryService = await props.services.getCategoryService();
  const getCategoryResult = await categoryService.getCategoryDetails({
    slug,
    options: {
      next: {
        revalidate: props.services.config.cacheTTL.pdp,
        tags: [`CATEGORY:${slug}`, "DETAIL-PAGE:CATEGORY"],
      },
    },
  });

  const category = getCategoryResult.data;

  if (!category) {
    return {
      title: "Category",
      description: "Category details",
    };
  }

  const rawDescription = category.description;
  const parsedDescription = editorJSDataToString(rawDescription)?.trim();
  const ogImageUrl = `${props.storefrontUrl}/categories/${slug}/opengraph-image`;

  return {
    title: category.seoTitle || category.name,
    description:
      category.seoDescription ??
      (parsedDescription?.length
        ? parsedDescription.slice(0, 200)
        : category.name),
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: category.name,
        },
      ],
      url: canonicalUrl,
      siteName: props.siteName,
    },
  };
}
