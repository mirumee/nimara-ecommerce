import { notFound } from "next/navigation";

import { type Category } from "@nimara/domain/objects/Category";
import type { ServiceRegistry } from "@nimara/infrastructure/types";

export interface CategoryProviderProps {
  languageCode: string;
  render: (data: { category: Category }) => React.ReactNode;
  services: ServiceRegistry;
  slug: string;
}

export const CategoryProvider = async ({
  render,
  slug,
  languageCode,
  services,
}: CategoryProviderProps) => {
  const categoryService = await services.getCategoryService();
  const getCategoryResult = await categoryService.getCategoryDetails({
    slug,
    languageCode,
    options: {
      next: {
        revalidate: services.config.cacheTTL.pdp,
        tags: [`CATEGORY:${slug}`, "DETAIL-PAGE:CATEGORY"],
      },
    },
  });

  if (!getCategoryResult.ok || !getCategoryResult.data) {
    return notFound();
  }

  return <>{render({ category: getCategoryResult.data })}</>;
};
