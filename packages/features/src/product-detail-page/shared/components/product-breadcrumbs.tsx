import { Breadcrumbs } from "@nimara/foundation/navigation/breadcrumbs";

type ProductBreadcrumbsProps = {
  category?: {
    name: string;
    slug: string;
  } | null;
  homePath: string;
  productName: string;
  searchPath: (query: { category: string }) => string;
};

export const ProductBreadcrumbs = ({
  productName,
  category,
  homePath,
  searchPath,
}: ProductBreadcrumbsProps) => {
  const productCrumbs = category
    ? [
        {
          label: category.name,
          href: searchPath({
            category: category.slug,
          }),
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
