"use client";

import { ChevronDown, ChevronUp, Filter, Plus, Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { Button } from "@nimara/ui/components/button";
import { Card, CardContent } from "@nimara/ui/components/card";
import { Input } from "@nimara/ui/components/input";
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
import type { OrderSortField, OrderStatus } from "@/graphql/generated/client";
import { useDebounce } from "@/hooks/use-debounce";
import { PRESET_DATE_RANGES } from "@/lib/orders-utils";
import { formatDateTime, formatPrice } from "@/lib/utils";

const DEFAULT_PAGE_SIZE = 15;
const PAGE_SIZE_OPTIONS = [15, 25, 50];

type Draft = {
  created: string;
  id: string;
  number: string;
  status: string;
  total: { gross: { amount: number; currency: string } };
  user: {
    email: string;
    firstName: string;
    lastName: string;
  } | null;
};

interface DraftsListClientProps {
  drafts: Draft[];
  pageInfo: {
    endCursor: string | null;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    startCursor: string | null;
  } | null;
}

export function DraftsListClient({ drafts, pageInfo }: DraftsListClientProps) {
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
  const createdGte = searchParams.get("createdGte");
  const createdLte = searchParams.get("createdLte");
  const sortField = searchParams.get("sortField") as OrderSortField | null;
  const sortDirection = searchParams.get("sortDirection") as
    | "ASC"
    | "DESC"
    | null;

  const activeDateFiltersCount = useMemo(() => {
    let count = 0;

    if (createdGte) {
      count++;
    }
    if (createdLte) {
      count++;
    }

    return count;
  }, [createdGte, createdLte]);

  const hasNextPage = pageInfo?.hasNextPage ?? false;
  const hasPreviousPage = pageInfo?.hasPreviousPage ?? false;

  const updateSearchParams = useCallback(
    (updates: {
      after?: string | null;
      before?: string | null;
      createdGte?: string | null;
      createdLte?: string | null;
      pageSize?: number;
      search?: string | null;
      sortDirection?: string | null;
      sortField?: string | null;
    }) => {
      const params = new URLSearchParams(searchParams.toString());

      // Remove pagination cursors when changing filters
      if (
        updates.search !== undefined ||
        updates.createdGte !== undefined ||
        updates.createdLte !== undefined
      ) {
        params.delete("after");
        params.delete("before");
      }

      Object.entries(updates).forEach(([key, value]) => {
        params.delete(key);
        if (value !== null && value !== undefined && value !== "") {
          params.set(key, String(value));
        }
      });

      if (params.get("pageSize") === String(DEFAULT_PAGE_SIZE)) {
        params.delete("pageSize");
      }

      router.push(`${pathname}?${params.toString()}`);
    },
    [pathname, router, searchParams],
  );

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
        <h2 className="text-2xl font-semibold">Drafts</h2>
        <Button
          type="button"
          className="bg-stone-900 hover:bg-stone-800"
          onClick={() => router.push("/orders/new")}
        >
          <Plus className="mr-2 h-4 w-4" />
          New order
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="flex p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search drafts..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="w-64 pl-9"
              />
            </div>

            <div className="flex flex-1" />

            <div className="flex items-center gap-2">
              {activeDateFiltersCount > 0 && (
                <DeletableChip
                  label={`Date created (${activeDateFiltersCount})`}
                  onDelete={() => handleDateRangeSelect(null)}
                />
              )}
            </div>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="ml-2 gap-2">
                  <Filter className="h-4 w-4" />
                  Filters
                  {activeDateFiltersCount > 0 && (
                    <span>({activeDateFiltersCount})</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="end">
                <ScrollArea className="h-[260px]">
                  <div className="space-y-4">
                    <div>
                      <h4 className="mb-2 font-medium">Date Range</h4>
                      <div className="space-y-2">
                        {PRESET_DATE_RANGES.map((preset) => (
                          <Button
                            key={preset.label}
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
                            {preset.label}
                          </Button>
                        ))}
                        {(createdGte || createdLte) && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full justify-start"
                            onClick={() => handleDateRangeSelect(null)}
                          >
                            Clear date range
                          </Button>
                        )}
                      </div>
                    </div>

                    {activeDateFiltersCount > 0 && (
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={clearFilters}
                      >
                        Clear all filters
                      </Button>
                    )}
                  </div>
                </ScrollArea>
              </PopoverContent>
            </Popover>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead
                  className="cursor-pointer select-none"
                  onClick={() => handleSort("NUMBER")}
                >
                  <div className="flex items-center gap-1">
                    Draft No.
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
                    Date
                    {sortField === "CREATION_DATE" &&
                      (sortDirection === "ASC" ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      ))}
                  </div>
                </TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {drafts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    No drafts found
                  </TableCell>
                </TableRow>
              ) : (
                drafts.map((draft) => (
                  <TableRow
                    key={draft.id}
                    className="cursor-pointer hover:bg-muted"
                    onClick={() => router.push(`/orders/${draft.id}`)}
                  >
                    <TableCell>#{draft.number}</TableCell>
                    <TableCell>{formatDateTime(draft.created)}</TableCell>
                    <TableCell>
                      {draft.user
                        ? `${draft.user.firstName} ${draft.user.lastName}`
                        : "-"}
                    </TableCell>
                    <TableCell>
                      {formatPrice(
                        draft.total.gross.amount,
                        draft.total.gross.currency,
                      )}
                    </TableCell>
                    <TableCell>
                      <ColorBadge label={draft.status as OrderStatus} />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          <div className="flex items-center justify-between border-t p-4">
            <div className="flex items-center gap-2">
              <span className="w-24 text-sm text-muted-foreground">
                View items
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
                    label="Previous"
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
                    label="Next"
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
