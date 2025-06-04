import { type SearchProduct } from "@nimara/domain/objects/SearchProduct";

import { ProductImagePlaceholder } from "@/components/product-image-placeholder";
import { SearchProductCard } from "@/components/search-product-card";
import { paths } from "@/lib/paths";

type Props = {
  products: SearchProduct[];
};

export const ProductsList = ({ products }: Props) => {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4">
      {products.map((product, index) => (
        <SearchProductCard
          key={`${product.id}-${index}`}
          name={product.name}
          price={product.price}
          thumbnailUrl={product.thumbnail?.url}
          productHref={paths.products.asPath({ slug: product.slug })}
          fallback={<ProductImagePlaceholder />}
        />
      ))}
    </div>
  );
};
