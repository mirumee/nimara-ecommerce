"use client";

import { ChevronDown, ChevronUp, Filter, Plus, Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@nimara/ui/components/button";
import { Card, CardContent } from "@nimara/ui/components/card";
import { Checkbox } from "@nimara/ui/components/checkbox";
import { Input } from "@nimara/ui/components/input";
import { Label } from "@nimara/ui/components/label";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@nimara/ui/components/pagination";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@nimara/ui/components/popover";
import { ScrollArea } from "@nimara/ui/components/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@nimara/ui/components/select";

import { ColorBadge } from "@/components/ui/color-badge";
import { DeletableChip } from "@/components/ui/deletable-chip";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type {
  OrderFilterInput,
  OrderSortField,
  OrderSortingInput,
  OrderStatus,
  OrderStatusFilter,
  PaymentChargeStatusEnum,
} from "@/graphql/generated/client";
import { useDebounce } from "@/hooks/use-debounce";
import {
  FULFILLMENT_STATUS_OPTIONS,
  getActiveFiltersCount,
  PAYMENT_STATUS_OPTIONS,
  PRESET_DATE_RANGES,
  toggleValueInArray,
} from "@/lib/orders-utils";
import { formatDateTime, formatPrice } from "@/lib/utils";

const DEFAULT_PAGE_SIZE = 15;
const PAGE_SIZE_OPTIONS = [15, 25, 50];

type Order = {
  created: string;
  id: string;
  number: string;
  paymentStatus: PaymentChargeStatusEnum;
  status: OrderStatus;
  total: { gross: { amount: number; currency: string } };
  user: {
    email: string;
    firstName: string;
    lastName: string;
  } | null;
};

interface OrdersListClientProps {
  orders: Order[];
  pageInfo: {
    endCursor: string | null;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    startCursor: string | null;
  } | null;
}

export function OrdersListClient({ orders, pageInfo }: OrdersListClientProps) {
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [searchValue, setSearchValue] = useState(
    searchParams.get("search") || "",
  );
  const debouncedSearch = useDebounce(searchValue, 300);

  const pageSize = parseInt(
    searchParams.get("pageSize") || String(DEFAULT_PAGE_SIZE),
    10,
  );
  const _after = searchParams.get("after");
  const _before = searchParams.get("before");
  const createdGte = searchParams.get("createdGte");
  const createdLte = searchParams.get("createdLte");
  const paymentStatus = searchParams.getAll("paymentStatus");
  const status = searchParams.getAll("status");
  const sortField = searchParams.get("sortField") as OrderSortField | null;
  const sortDirection = searchParams.get("sortDirection") as
    | "ASC"
    | "DESC"
    | null;

  const filter: OrderFilterInput | undefined =
    debouncedSearch ||
    createdGte ||
    createdLte ||
    paymentStatus.length > 0 ||
    status.length > 0
      ? {
          ...(debouncedSearch && { search: debouncedSearch }),
          ...((createdGte || createdLte) && {
            created: {
              gte: createdGte || undefined,
              lte: createdLte || undefined,
            },
          }),
          ...(paymentStatus.length > 0 && {
            paymentStatus: paymentStatus as PaymentChargeStatusEnum[],
          }),
          ...(status.length > 0 && { status: status as OrderStatusFilter[] }),
        }
      : undefined;

  const _sortBy: OrderSortingInput | undefined =
    sortField && sortDirection
      ? { field: sortField, direction: sortDirection }
      : undefined;

  const activeFiltersCount = getActiveFiltersCount(filter);
  const hasNextPage = pageInfo?.hasNextPage ?? false;
  const hasPreviousPage = pageInfo?.hasPreviousPage ?? false;

  const updateSearchParams = useCallback(
    (updates: {
      after?: string | null;
      before?: string | null;
      createdGte?: string | null;
      createdLte?: string | null;
      pageSize?: number;
      paymentStatus?: string[];
      search?: string | null;
      sortDirection?: string | null;
      sortField?: string | null;
      status?: string[];
    }) => {
      const params = new URLSearchParams(searchParams.toString());

      // Remove pagination cursors when changing filters
      if (
        updates.search !== undefined ||
        updates.createdGte !== undefined ||
        updates.createdLte !== undefined ||
        updates.paymentStatus !== undefined ||
        updates.status !== undefined
      ) {
        params.delete("after");
        params.delete("before");
      }

      // Update or delete parameters
      Object.entries(updates).forEach(([key, value]) => {
        params.delete(key);
        if (Array.isArray(value)) {
          value.forEach((v) => params.append(key, v));
        } else if (value !== null && value !== undefined && value !== "") {
          params.set(key, String(value));
        }
      });

      // Remove default values
      if (params.get("pageSize") === String(DEFAULT_PAGE_SIZE)) {
        params.delete("pageSize");
      }

      const query = params.toString();

      router.replace(`${pathname}${query ? `?${query}` : ""}`);
    },
    [pathname, router, searchParams],
  );

  // Update search param when debounced value changes
  useEffect(() => {
    if (debouncedSearch !== (searchParams.get("search") || "")) {
      updateSearchParams({ search: debouncedSearch || null });
    }
  }, [debouncedSearch, searchParams, updateSearchParams]);

  const handlePageSizeChange = (newSize: string) => {
    updateSearchParams({
      pageSize: parseInt(newSize, 10),
      after: null,
      before: null,
    });
  };

  const handleNextPage = () => {
    if (pageInfo?.endCursor) {
      updateSearchParams({ after: pageInfo.endCursor, before: null });
    }
  };

  const handlePreviousPage = () => {
    if (pageInfo?.startCursor) {
      updateSearchParams({ before: pageInfo.startCursor, after: null });
    }
  };

  const handleSort = (field: OrderSortField) => {
    const newDirection =
      sortField === field && sortDirection === "DESC" ? "ASC" : "DESC";

    updateSearchParams({ sortField: field, sortDirection: newDirection });
  };

  const togglePaymentStatus = (value: string) => {
    const isCurrentlyChecked = paymentStatus.includes(value);
    const newValues = toggleValueInArray(
      paymentStatus,
      value,
      !isCurrentlyChecked,
    );

    updateSearchParams({ paymentStatus: newValues });
  };

  const toggleStatus = (value: string) => {
    const isCurrentlyChecked = status.includes(value);
    const newValues = toggleValueInArray(status, value, !isCurrentlyChecked);

    updateSearchParams({ status: newValues });
  };

  const handleDateRangeSelect = (
    range: { from: string; to: string } | null,
  ) => {
    if (range) {
      updateSearchParams({ createdGte: range.from, createdLte: range.to });
    } else {
      updateSearchParams({ createdGte: null, createdLte: null });
    }
  };

  const clearFilters = () => {
    router.push(pathname);
    setSearchValue("");
  };

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">
          {t("marketplace.orders.list.title")}
        </h2>
        <Button
          type="button"
          className="bg-stone-900 hover:bg-stone-800"
          onClick={() => router.push("/orders/new")}
        >
          <Plus className="mr-2 h-4 w-4" />
          {t("common.new-order")}
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="flex p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t("marketplace.orders.list.search-placeholder")}
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="w-64 pl-9"
              />
            </div>

            <div className="flex flex-1" />

            <div className="flex items-center gap-2">
              {activeFiltersCount.date > 0 && (
                <DeletableChip
                  label={t("common.chip-date-created", {
                    count: activeFiltersCount.date,
                  })}
                  onDelete={() => handleDateRangeSelect(null)}
                />
              )}

              {activeFiltersCount.paymentStatus > 0 && (
                <DeletableChip
                  label={t("marketplace.orders.list.chip-payment-status", {
                    count: activeFiltersCount.paymentStatus,
                  })}
                  onDelete={() => updateSearchParams({ paymentStatus: [] })}
                />
              )}

              {activeFiltersCount.fulfillmentStatus > 0 && (
                <DeletableChip
                  label={t("marketplace.orders.list.chip-fulfillment-status", {
                    count: activeFiltersCount.fulfillmentStatus,
                  })}
                  onDelete={() => updateSearchParams({ status: [] })}
                />
              )}
            </div>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="ml-2 gap-2">
                  <Filter className="h-4 w-4" />
                  {t("common.filter-button")}
                  {activeFiltersCount.total > 0 && (
                    <span>({activeFiltersCount.total})</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="end">
                <ScrollArea className="h-[400px]">
                  <div className="space-y-4">
                    <div>
                      <h4 className="mb-2 font-medium">
                        {t("common.filter-date-range")}
                      </h4>
                      <div className="space-y-2">
                        {PRESET_DATE_RANGES.map((preset) => (
                          <Button
                            key={preset.labelKey}
                            variant="outline"
                            size="sm"
                            className="w-full justify-start"
                            onClick={() =>
                              handleDateRangeSelect({
                                from: preset.gte,
                                to: preset.lte,
                              })
                            }
                          >
                            {t(`common.${preset.labelKey}`)}
                          </Button>
                        ))}
                        {(createdGte || createdLte) && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full justify-start"
                            onClick={() => handleDateRangeSelect(null)}
                          >
                            {t("common.filter-date-clear")}
                          </Button>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="mb-2 font-medium">
                        {t("marketplace.orders.list.filter-payment-status")}
                      </h4>
                      <div className="space-y-2">
                        {PAYMENT_STATUS_OPTIONS.map((opt) => (
                          <div key={opt} className="flex items-center gap-2">
                            <Checkbox
                              id={`payment-${opt}`}
                              checked={paymentStatus.includes(opt)}
                              onCheckedChange={() => togglePaymentStatus(opt)}
                            />
                            <Label
                              htmlFor={`payment-${opt}`}
                              className="flex-1"
                            >
                              {t(
                                `marketplace.orders.list.payment-status-${opt}`,
                              )}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="mb-2 font-medium">
                        {t("marketplace.orders.list.filter-fulfillment-status")}
                      </h4>
                      <div className="space-y-2">
                        {FULFILLMENT_STATUS_OPTIONS.map((opt) => (
                          <div key={opt} className="flex items-center gap-2">
                            <Checkbox
                              id={`status-${opt}`}
                              checked={status.includes(opt)}
                              onCheckedChange={() => toggleStatus(opt)}
                            />
                            <Label htmlFor={`status-${opt}`} className="flex-1">
                              {t(
                                `marketplace.orders.list.fulfillment-status-${opt}`,
                              )}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {activeFiltersCount.total > 0 && (
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={clearFilters}
                      >
                        {t("common.filter-clear-all")}
                      </Button>
                    )}
                  </div>
                </ScrollArea>
              </PopoverContent>
            </Popover>
          </div>

          <Table>
            <TableHeader>
              <TableRow className="border-t px-6 py-4">
                <TableHead
                  className="cursor-pointer select-none"
                  onClick={() => handleSort("NUMBER")}
                >
                  <div className="flex items-center gap-1">
                    {t("marketplace.orders.list.table-order-no")}
                    {sortField === "NUMBER" &&
                      (sortDirection === "ASC" ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      ))}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer select-none"
                  onClick={() => handleSort("CREATION_DATE")}
                >
                  <div className="flex items-center gap-1">
                    {t("common.date")}
                    {sortField === "CREATION_DATE" &&
                      (sortDirection === "ASC" ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      ))}
                  </div>
                </TableHead>
                <TableHead>{t("common.customer")}</TableHead>
                <TableHead>{t("common.total")}</TableHead>
                <TableHead>
                  {t("marketplace.orders.list.table-payment-status")}
                </TableHead>
                <TableHead>
                  {t("marketplace.orders.list.table-fulfillment-status")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    {t("marketplace.orders.list.empty-list")}
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <TableRow
                    key={order.id}
                    className="cursor-pointer hover:bg-muted"
                    onClick={() => router.push(`/orders/${order.id}`)}
                  >
                    <TableCell>#{order.number}</TableCell>
                    <TableCell>{formatDateTime(order.created)}</TableCell>
                    <TableCell>
                      {order.user
                        ? `${order.user.firstName} ${order.user.lastName}`
                        : "-"}
                    </TableCell>
                    <TableCell>
                      {formatPrice(
                        order.total.gross.amount,
                        order.total.gross.currency,
                      )}
                    </TableCell>
                    <TableCell>
                      <ColorBadge label={order.paymentStatus} />
                    </TableCell>
                    <TableCell>
                      <ColorBadge label={order.status} />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          <div className="flex items-center justify-between border-t p-4">
            <div className="flex items-center gap-2">
              <span className="w-24 text-sm text-muted-foreground">
                {t("common.view-items")}
              </span>
              <Select
                value={String(pageSize)}
                onValueChange={handlePageSizeChange}
              >
                <SelectTrigger className="w-[70px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAGE_SIZE_OPTIONS.map((size) => (
                    <SelectItem key={size} value={String(size)}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    label={t("common.previous")}
                    onClick={handlePreviousPage}
                    className={
                      !hasPreviousPage
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext
                    label={t("common.next")}
                    onClick={handleNextPage}
                    className={
                      !hasNextPage
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
