import { getServerAuthToken } from "@/lib/auth/server";
import { vendorsService } from "@/services";

import { VendorsListClient } from "./_components/vendors-list-client";

const DEFAULT_PAGE_SIZE = 20;

type PageProps = {
  searchParams: Promise<{
    after?: string;
    before?: string;
    pageSize?: string;
    search?: string;
  }>;
};

export default async function VendorsPage({ searchParams }: PageProps) {
  const params = await searchParams;

  const pageSize = Math.min(
    parseInt(params.pageSize ?? String(DEFAULT_PAGE_SIZE), 10) ||
      DEFAULT_PAGE_SIZE,
    100,
  );
  const after = params.after;
  const before = params.before;
  const search = params.search?.trim() || undefined;

  const token = await getServerAuthToken();
  const result = await vendorsService.getVendors(
    {
      first: before ? undefined : pageSize,
      last: before ? pageSize : undefined,
      after: after ?? undefined,
      before: before ?? undefined,
      search: search ?? undefined,
    },
    token,
  );

  if (!result.ok) {
    return (
      <div className="flex flex-col gap-4">
        <h2 className="text-2xl font-semibold">Vendors</h2>
        <p className="text-muted-foreground">Failed to load vendors</p>
      </div>
    );
  }

  const vendors = result.data.customers?.edges?.map((e) => e.node) ?? [];
  const pageInfo = result.data.customers?.pageInfo ?? null;
  const totalCount = result.data.customers?.totalCount ?? 0;

  return (
    <VendorsListClient
      vendors={vendors}
      pageInfo={pageInfo}
      totalCount={totalCount}
      pageSize={pageSize}
      search={search}
    />
  );
}
