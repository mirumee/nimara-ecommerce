import { type Category } from "@nimara/domain/objects/Category";

import { type CategoryFragment } from "../graphql/fragments/generated";

export const categorySerializer = (data: CategoryFragment): Category => {
  return {
    id: data.id,
    name: data.name,
    description: data.description,
    slug: data.slug,
    seoDescription: data.seoDescription,
    seoTitle: data.seoTitle,
    backgroundImage: data.backgroundImage?.url
      ? {
          url: data.backgroundImage.url,
          alt: data.backgroundImage?.alt ?? "",
        }
      : null,
  };
};
