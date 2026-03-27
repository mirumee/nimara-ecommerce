"use client";

import { Plus, Search } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@nimara/ui/components/select";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDebounce } from "@/hooks/use-debounce";

const DEFAULT_PAGE_SIZE = 15;
const PAGE_SIZE_OPTIONS = [15, 25, 50];

type Collection = {
  backgroundImage: { alt: string | null; url: string } | null;
  channelListings: Array<{
    channel: { id: string; name: string };
    isPublished: boolean;
  }> | null;
  id: string;
  name: string;
  products: {
    totalCount: number | null;
  } | null;
  slug: string;
};

function getChannelBadgeProps(
  collection: Collection,
  t: (key: string, values?: Record<string, string | number | Date>) => string,
): {
  label: string;
  variant: "published" | "hidden" | "none";
} {
  const listings = collection.channelListings ?? [];
  const total = listings.length;
  const publishedCount = listings.filter((l) => l.isPublished).length;

  if (total === 0) {
    return {
      label: t("marketplace.collections.list.channel-none"),
      variant: "none",
    };
  }

  const channelLabel = t("common.channel-count", { count: total });

  if (publishedCount === 0) {
    return {
      label: `${total} ${channelLabel}`,
      variant: "hidden",
    };
  }

  return {
    label: `${total} ${channelLabel}`,
    variant: "published",
  };
}

interface CollectionsListClientProps {
  collections: Collection[];
}

export function CollectionsListClient({
  collections,
}: CollectionsListClientProps) {
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
  const normalizedPageSize = PAGE_SIZE_OPTIONS.includes(pageSize)
    ? pageSize
    : DEFAULT_PAGE_SIZE;
  const page = parseInt(searchParams.get("page") || "1", 10);
  const currentPage = Number.isNaN(page) || page < 1 ? 1 : page;
  const totalPages = Math.max(
    1,
    Math.ceil(collections.length / normalizedPageSize),
  );
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const hasNextPage = safeCurrentPage < totalPages;
  const hasPreviousPage = safeCurrentPage > 1;
  const paginatedCollections = collections.slice(
    (safeCurrentPage - 1) * normalizedPageSize,
    safeCurrentPage * normalizedPageSize,
  );

  const updateSearchParams = (updates: {
    page?: number | null;
    pageSize?: number | null;
    search?: string | null;
  }) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      params.delete(key);
      if (value !== null && value !== undefined && value !== "") {
        params.set(key, String(value));
      }
    });

    if (params.get("page") === "1") {
      params.delete("page");
    }

    if (params.get("pageSize") === String(DEFAULT_PAGE_SIZE)) {
      params.delete("pageSize");
    }

    const query = params.toString();

    router.replace(`${pathname}${query ? `?${query}` : ""}`);
  };

  useEffect(() => {
    const currentSearch = searchParams.get("search") || "";

    if (currentSearch === debouncedSearch) {
      return;
    }

    updateSearchParams({
      page: 1,
      search: debouncedSearch || null,
    });
  }, [debouncedSearch, searchParams]);

  const handlePageSizeChange = (newSize: string) => {
    updateSearchParams({
      page: 1,
      pageSize: parseInt(newSize, 10),
    });
  };

  const handleNextPage = () => {
    if (!hasNextPage) {
      return;
    }

    updateSearchParams({
      page: safeCurrentPage + 1,
    });
  };

  const handlePreviousPage = () => {
    if (!hasPreviousPage) {
      return;
    }

    updateSearchParams({
      page: safeCurrentPage - 1,
    });
  };

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">
          {t("marketplace.collections.list.title")}
        </h2>
        <Button asChild>
          <Link href="/collections/new">
            <Plus className="mr-2 h-4 w-4" />
            {t("marketplace.collections.list.add-collection")}
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="flex p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
              <Input
                placeholder={t(
                  "marketplace.collections.list.search-placeholder",
                )}
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="w-64 pl-9"
              />
            </div>
          </div>

          {collections.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground">
                {t("marketplace.collections.list.empty-list")}
              </p>
              <Button asChild variant="link" className="mt-2">
                <Link href="/collections/new">
                  {t("marketplace.collections.list.empty-cta")}
                </Link>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-t px-6 py-4">
                  <TableHead>
                    {t("marketplace.collections.list.table-name")}
                  </TableHead>
                  <TableHead>
                    {t("marketplace.collections.list.table-products-count")}
                  </TableHead>
                  <TableHead>
                    {t("marketplace.collections.list.table-availability")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedCollections.map((collection) => {
                  const productCount = collection.products?.totalCount ?? 0;
                  const { label, variant } = getChannelBadgeProps(
                    collection,
                    t,
                  );

                  return (
                    <TableRow
                      key={collection.id}
                      className="cursor-pointer hover:bg-muted"
                      onClick={() =>
                        router.push(`/collections/${collection.id}`)
                      }
                    >
                      <TableCell className="font-medium">
                        {collection.name}
                      </TableCell>
                      <TableCell>{productCount}</TableCell>
                      <TableCell>
                        {variant === "none" && (
                          <span className="inline-flex items-center rounded-full bg-pink-100 px-2.5 py-0.5 text-xs font-medium text-pink-800">
                            {label}
                          </span>
                        )}
                        {variant === "hidden" && (
                          <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                            {label}
                          </span>
                        )}
                        {variant === "published" && (
                          <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                            {label}
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}

          <div className="flex items-center justify-between border-t p-4">
            <div className="flex items-center gap-2">
              <span className="w-24 text-sm text-muted-foreground">
                {t("common.view-items")}
              </span>
              <Select
                value={String(normalizedPageSize)}
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
