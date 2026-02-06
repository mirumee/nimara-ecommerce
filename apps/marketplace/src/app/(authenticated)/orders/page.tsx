import type {
  OrderFilterInput,
  OrderSortField,
  OrderSortingInput,
  OrderStatusFilter,
  PaymentChargeStatusEnum,
} from "@/graphql/generated/client";
import { getServerAuthToken } from "@/lib/auth/server";
import { ordersService } from "@/services";

import { OrdersListClient } from "./_components/orders-list-client";

const DEFAULT_PAGE_SIZE = 15;
const PAGE_SIZE_OPTIONS = [15, 25, 50];

type PageProps = {
  searchParams: Promise<{
    after?: string;
    before?: string;
    createdGte?: string;
    createdLte?: string;
    pageSize?: string;
    paymentStatus?: string | string[];
    search?: string;
    sortDirection?: string;
    sortField?: string;
    status?: string | string[];
  }>;
};

export default async function OrdersPage({ searchParams }: PageProps) {
  const params = await searchParams;

  const rawPageSize = parseInt(params.pageSize ?? String(DEFAULT_PAGE_SIZE), 10);
  const pageSize = PAGE_SIZE_OPTIONS.includes(rawPageSize)
    ? rawPageSize
    : DEFAULT_PAGE_SIZE;

  const after = params.after;
  const before = params.before;
  const search = params.search?.trim() || undefined;
  const createdGte = params.createdGte || undefined;
  const createdLte = params.createdLte || undefined;

  const paymentStatus = Array.isArray(params.paymentStatus)
    ? params.paymentStatus
    : params.paymentStatus
      ? [params.paymentStatus]
      : [];

  const status = Array.isArray(params.status)
    ? params.status
    : params.status
      ? [params.status]
      : [];

  const sortField = params.sortField as OrderSortField | null;
  const sortDirection = params.sortDirection as "ASC" | "DESC" | null;

  const filter: OrderFilterInput | undefined =
    search ||
      createdGte ||
      createdLte ||
      paymentStatus.length > 0 ||
      status.length > 0
      ? {
        ...(search && { search }),
        ...((createdGte || createdLte) && {
          created: { gte: createdGte, lte: createdLte },
        }),
        ...(paymentStatus.length > 0 && {
          paymentStatus: paymentStatus as PaymentChargeStatusEnum[],
        }),
        ...(status.length > 0 && { status: status as OrderStatusFilter[] }),
      }
      : undefined;

  const sortBy: OrderSortingInput | undefined =
    sortField && sortDirection
      ? { field: sortField, direction: sortDirection }
      : undefined;

  const token = await getServerAuthToken();
  const result = await ordersService.getOrders(
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
        <p className="text-muted-foreground">Failed to load orders</p>
      </div>
    );
  }

  const orders = result.data.orders?.edges?.map((e) => e.node) ?? [];
  const pageInfo = result.data.orders?.pageInfo || null;

  return <OrdersListClient orders={orders} pageInfo={pageInfo} />;
}
