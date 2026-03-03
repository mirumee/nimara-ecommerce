import { type SearchProduct } from "@nimara/domain/objects/SearchProduct";
import { SearchProductCard } from "@nimara/features/shared/product/search-product-card";

type Props = {
  productPath: (slug: string) => string;
  products: SearchProduct[];
};

export const ProductsList = ({ products, productPath }: Props) => {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4">
      {products.map((product, index) => (
        <SearchProductCard
          key={`${product.id}-${index}`}
          product={product}
          productPath={productPath(product.slug)}
        />
      ))}
    </div>
  );
};
