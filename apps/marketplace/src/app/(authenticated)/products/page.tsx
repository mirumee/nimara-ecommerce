import type { ProductFilterInput } from "@/graphql/generated/client";
import { getServerAuthToken } from "@/lib/auth/server";
import { productsService } from "@/services";

import { ProductsListClient } from "./_components/products-list-client";

type PageProps = {
  searchParams: Promise<{
    search?: string;
    status?: string | string[];
  }>;
};

export default async function ProductsPage({ searchParams }: PageProps) {
  const params = await searchParams;

  const search = params.search?.trim() || undefined;
  const statusFilter = Array.isArray(params.status)
    ? params.status
    : params.status
      ? [params.status]
      : [];

  const productFilter: ProductFilterInput | undefined =
    statusFilter.length === 0
      ? search
        ? { search }
        : undefined
      : statusFilter.length === 2
        ? search
          ? { search }
          : undefined
        : {
          isPublished: statusFilter.includes("published"),
          ...(search && { search }),
        };

  const token = await getServerAuthToken();
  const result = await productsService.getProducts(
    {
      first: 20,
      search: search,
      filter: productFilter,
    },
    token,
  );

  if (!result.ok) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Failed to load products</p>
      </div>
    );
  }

  const products = result.data.products?.edges?.map((e) => e.node) || [];

  return <ProductsListClient products={products} />;
}
