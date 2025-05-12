import { type SearchProduct } from "@nimara/domain/objects/SearchProduct";

import { SearchProductCard } from "@/components/search-product-card";
import { type PreviousPage } from "@/types";

type Props = {
  previousPage: PreviousPage;
  products: SearchProduct[];
  sourceSlug?: string;
};

export const ProductsList = ({ products, previousPage, sourceSlug }: Props) => {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4">
      {products.map((product, index) => (
        <SearchProductCard
          previousPage={previousPage}
          sourceSlug={sourceSlug}
          key={`${product.id}-${index}`}
          product={product}
        />
      ))}
    </div>
  );
};
