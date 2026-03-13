import { getTranslations } from "next-intl/server";

import type {
  OrderDraftFilterInput,
  OrderSortField,
  OrderSortingInput,
} from "@/graphql/generated/client";
import { getServerAuthToken } from "@/lib/auth/server";
import { ordersService } from "@/services";

import { DraftsListClient } from "./_components/drafts-list-client";

const DEFAULT_PAGE_SIZE = 15;
const PAGE_SIZE_OPTIONS = [15, 25, 50];

type PageProps = {
  searchParams: Promise<{
    after?: string;
    before?: string;
    createdGte?: string;
    createdLte?: string;
    pageSize?: string;
    search?: string;
    sortDirection?: string;
    sortField?: string;
  }>;
};

export default async function DraftsPage({ searchParams }: PageProps) {
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
  const createdGte = params.createdGte || undefined;
  const createdLte = params.createdLte || undefined;

  const sortField = params.sortField as OrderSortField | null;
  const sortDirection = params.sortDirection as "ASC" | "DESC" | null;

  const filter: OrderDraftFilterInput | undefined =
    search || createdGte || createdLte
      ? {
          ...(search && { search }),
          ...((createdGte || createdLte) && {
            created: { gte: createdGte, lte: createdLte },
          }),
        }
      : undefined;

  const sortBy: OrderSortingInput | undefined =
    sortField && sortDirection
      ? { field: sortField, direction: sortDirection }
      : undefined;

  const token = await getServerAuthToken();
  const result = await ordersService.getDraftOrders(
    {
      after: after ?? undefined,
      before: before ?? undefined,
      filter: filter ?? undefined,
      first: before ? undefined : pageSize,
      last: before ? pageSize : undefined,
      sortBy: sortBy ?? undefined,
    },
    token,
  );

  if (!result.ok) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">
          {t("marketplace.drafts.list.failed-to-load")}
        </p>
      </div>
    );
  }

  const drafts = result.data.draftOrders?.edges?.map((e) => e.node) ?? [];
  const pageInfo = result.data.draftOrders?.pageInfo || null;

  return <DraftsListClient drafts={drafts} pageInfo={pageInfo} />;
}
