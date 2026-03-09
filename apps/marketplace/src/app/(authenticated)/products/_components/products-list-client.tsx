"use client";

import { Filter, Plus, Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@nimara/ui/components/select";

import { ColorBadge } from "@/components/ui/color-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDebounce } from "@/hooks/use-debounce";
import { formatDateTime } from "@/lib/utils";

const DEFAULT_PAGE_SIZE = 15;
const PAGE_SIZE_OPTIONS = [15, 25, 50];

const PUBLISHED_FILTER_OPTIONS = [
  { value: "published", label: "Published" },
  { value: "draft", label: "Draft" },
] as const;

type Product = {
  category: { name: string } | null;
  channelListings: Array<{ isPublished: boolean }> | null;
  created: string;
  id: string;
  name: string;
  pricing: {
    priceRange: {
      start: {
        gross: {
          amount: number;
          currency: string;
        };
      } | null;
    } | null;
  } | null;
  productType: { name: string } | null;
  slug: string;
  thumbnail: { alt: string | null; url: string } | null;
};

interface ProductsListClientProps {
  pageInfo: {
    endCursor: string | null;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    startCursor: string | null;
  } | null;
  products: Product[];
}

export function ProductsListClient({
  products,
  pageInfo,
}: ProductsListClientProps) {
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
  const publishedFilter = searchParams.getAll("status");

  const hasNextPage = pageInfo?.hasNextPage ?? false;
  const hasPreviousPage = pageInfo?.hasPreviousPage ?? false;

  const updateSearchParams = useCallback(
    (updates: {
      after?: string | null;
      before?: string | null;
      pageSize?: number;
      search?: string | null;
      status?: string[];
    }) => {
      const params = new URLSearchParams(searchParams.toString());

      // Remove pagination cursors when changing filters
      if (updates.search !== undefined || updates.status !== undefined) {
        params.delete("after");
        params.delete("before");
      }

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

  const togglePublishedFilter = (value: string) => {
    const currentValues = publishedFilter;
    const newValues = currentValues.includes(value)
      ? currentValues.filter((v) => v !== value)
      : [...currentValues, value];

    updateSearchParams({ status: newValues });
  };

  const clearFilters = () => {
    router.push(pathname);
    setSearchValue("");
  };

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Products</h2>
        <Button asChild>
          <Link href="/products/new">
            <Plus className="mr-2 h-4 w-4" />
            Add product
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="flex p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
              <Input
                placeholder="Search"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="w-64 pl-9"
              />
            </div>
            <div className="flex grow" />
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="gap-2 bg-transparent">
                  <Filter className="h-4 w-4" />
                  Filter
                  {publishedFilter.length > 0 && (
                    <span className="text-muted-foreground">
                      ({publishedFilter.length})
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="min-w-[240px]" align="end">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">Filter</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="h-auto py-1 text-xs"
                    >
                      Clear all
                    </Button>
                  </div>
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium">Status</h4>
                    <div className="space-y-2">
                      {PUBLISHED_FILTER_OPTIONS.map((opt) => (
                        <div
                          key={opt.value}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={`product-${opt.value}`}
                            checked={publishedFilter.includes(opt.value)}
                            onCheckedChange={() =>
                              togglePublishedFilter(opt.value)
                            }
                          />
                          <Label
                            htmlFor={`product-${opt.value}`}
                            className="cursor-pointer text-sm font-normal"
                          >
                            {opt.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground">No products found</p>
              <Button asChild variant="link" className="mt-2">
                <Link href="/products/new">Create your first product</Link>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-t px-6 py-4">
                  <TableHead className="w-[80px]">Image</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Created At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow
                    key={product.id}
                    className="cursor-pointer hover:bg-muted"
                    onClick={() => router.push(`/products/${product.id}`)}
                  >
                    <TableCell>
                      {product.thumbnail?.url ? (
                        <Image
                          width={40}
                          height={40}
                          src={product.thumbnail.url}
                          alt={product.thumbnail.alt || product.name}
                          className="h-10 w-10 rounded object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="h-10 w-10 rounded bg-muted" />
                      )}
                    </TableCell>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>
                      <ColorBadge
                        label={
                          product.channelListings?.some((l) => l.isPublished)
                            ? "Published"
                            : "Draft"
                        }
                      />
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {product.productType?.name || "-"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {product.category?.name || "-"}
                    </TableCell>
                    <TableCell>{formatDateTime(product.created)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

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
