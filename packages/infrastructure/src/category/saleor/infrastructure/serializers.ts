import { type Category } from "@nimara/domain/objects/Category";

import { getTranslation } from "#root/lib/saleor";

import { type CategoryFragment } from "../graphql/fragments/generated";

export const categorySerializer = (data: CategoryFragment): Category => {
  return {
    id: data.id,
    name: getTranslation("name", data),
    description: data.translation?.description || data.description,
    slug: data.slug,
    seoDescription: data.translation?.seoDescription || data.seoDescription,
    seoTitle: data.translation?.seoTitle || data.seoTitle,
    backgroundImage: data.backgroundImage?.url
      ? {
          url: data.backgroundImage.url,
          alt: data.backgroundImage?.alt ?? "",
        }
      : null,
  };
};
