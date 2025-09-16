import { Breadcrumbs } from "@/components/breadcrumbs";
import { paths } from "@/lib/paths";

type ProductBreadcrumbsProps = {
  category?: {
    name: string;
    slug: string;
  } | null;
  productName: string;
};

export const ProductBreadcrumbs = ({
  productName,
  category,
}: ProductBreadcrumbsProps) => {
  const productCrumbs = category
    ? [
        {
          label: category.name,
          href: paths.search.asPath({
            query: {
              category: category.slug,
            },
          }),
        },
      ]
    : undefined;

  return <Breadcrumbs crumbs={productCrumbs} pageName={productName} />;
};
