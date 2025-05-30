import { type Collection } from "@nimara/domain/objects/Collection";

import { type CollectionFragment } from "../graphql/fragments/generated";

export const collectionSerializer = (data: CollectionFragment): Collection => {
  return {
    id: data.id,
    name: data.name,
    description: data.description,
    thumbnail: data.backgroundImage?.url
      ? {
          url: data.backgroundImage.url,
          alt: data.backgroundImage?.alt ?? "",
        }
      : null,
    slug: data.slug,
    seoDescription: data.seoDescription,
    seoTitle: data.seoTitle,
    products:
      data.products?.edges.map(({ node }) => ({
        id: node.id,
        name: node.name,
        currency: node.pricing?.priceRange?.start?.currency ?? "",
        media: null,
        price: node.pricing?.priceRange?.start?.gross.amount ?? 0,
        slug: node.slug,
        thumbnail: node.thumbnail?.url
          ? {
              url: node.thumbnail?.url,
              alt: node.thumbnail?.alt ?? "",
            }
          : null,
        updatedAt: new Date(node.updatedAt),
      })) ?? [],
  };
};
