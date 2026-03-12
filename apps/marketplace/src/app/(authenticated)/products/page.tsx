import { getTranslations } from "next-intl/server";

import type { ProductFilterInput } from "@/graphql/generated/client";
import { getServerAuthToken } from "@/lib/auth/server";
import { productsService } from "@/services";

import { ProductsListClient } from "./_components/products-list-client";

const DEFAULT_PAGE_SIZE = 15;
const PAGE_SIZE_OPTIONS = [15, 25, 50];

type PageProps = {
  searchParams: Promise<{
    after?: string;
    before?: string;
    pageSize?: string;
    search?: string;
    status?: string | string[];
  }>;
};

export default async function ProductsPage({ searchParams }: PageProps) {
  const t = await getTranslations();
  const params = await searchParams;

  const rawPageSize = parseInt(
    params.pageSize ?? String(DEFAULT_PAGE_SIZE),
    10,
  );
  const pageSize = PAGE_SIZE_OPTIONS.includes(rawPageSize)
    ? rawPageSize
    : DEFAULT_PAGE_SIZE;

  const after = params.after;
  const before = params.before;
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
      after: after ?? undefined,
      before: before ?? undefined,
      first: before ? undefined : pageSize,
      last: before ? pageSize : undefined,
      search: search,
      filter: productFilter,
    },
    token,
  );

  if (!result.ok) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">
          {t("marketplace.products.list.failed-to-load")}
        </p>
      </div>
    );
  }

  const products = result.data.products?.edges?.map((e) => e.node) || [];
  const pageInfo = result.data.products?.pageInfo || null;

  return <ProductsListClient products={products} pageInfo={pageInfo} />;
}
