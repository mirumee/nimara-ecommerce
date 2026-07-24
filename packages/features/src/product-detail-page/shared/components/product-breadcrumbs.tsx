import { Breadcrumbs } from "@nimara/foundation/navigation/breadcrumbs";

type ProductBreadcrumbsProps = {
  category?: {
    name: string;
    slug: string;
  } | null;
  categoryPath: (slug: string) => string;
  homePath: string;
  productName: string;
};

export const ProductBreadcrumbs = ({
  productName,
  category,
  homePath,
  categoryPath,
}: ProductBreadcrumbsProps) => {
  const productCrumbs = category
    ? [
        {
          label: category.name,
          href: categoryPath(category.slug),
        },
      ]
    : undefined;

  return (
    <Breadcrumbs
      crumbs={productCrumbs}
      pageName={productName}
      homePath={homePath}
    />
  );
};
