import { type SearchProduct } from "@nimara/domain/objects/SearchProduct";

import { SearchProductCard } from "@/components/search-product-card";

type Props = {
  products: SearchProduct[];
};

export const ProductsList = ({ products }: Props) => {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4">
      {products.map((product, index) => (
        <SearchProductCard key={`${product.id}-${index}`} product={product} />
      ))}
    </div>
  );
};
