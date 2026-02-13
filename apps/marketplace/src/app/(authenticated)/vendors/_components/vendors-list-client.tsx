"use client";

import { Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDateTime } from "@/lib/utils";

type Vendor = {
  dateJoined: string;
  email: string;
  firstName: string;
  id: string;
  isActive: boolean;
  lastName: string;
};

type PageInfo = {
  endCursor: string | null;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor: string | null;
};

type Props = {
  pageInfo: PageInfo | null;
  pageSize: number;
  search?: string;
  totalCount: number;
  vendors: Vendor[];
};

export function VendorsListClient({
  vendors,
  pageInfo,
  totalCount,
  pageSize,
  search: initialSearch,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const search = (formData.get("search") as string)?.trim() || "";
    const params = new URLSearchParams(searchParams);

    if (search) {
      params.set("search", search);
      params.delete("after");
      params.delete("before");
    } else {
      params.delete("search");
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const handlePrevPage = () => {
    if (!pageInfo?.hasPreviousPage || !pageInfo?.startCursor) {
      return;
    }
    const params = new URLSearchParams(searchParams);

    params.set("before", pageInfo.startCursor);
    params.delete("after");
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleNextPage = () => {
    if (!pageInfo?.hasNextPage || !pageInfo?.endCursor) {
      return;
    }
    const params = new URLSearchParams(searchParams);

    params.set("after", pageInfo.endCursor);
    params.delete("before");
    router.push(`${pathname}?${params.toString()}`);
  };

  const displayName = (v: Vendor) =>
    [v.firstName, v.lastName].filter(Boolean).join(" ") || v.email || "—";

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Vendors</h2>
        <form onSubmit={handleSearchSubmit} className="relative w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            name="search"
            placeholder="Search by name or email..."
            defaultValue={initialSearch}
            className="pl-9"
          />
        </form>
      </div>

      <Card>
        <CardContent className="p-0">
          {vendors.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-muted-foreground">
                {initialSearch
                  ? "No vendors match your search"
                  : "No vendors found"}
              </p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vendors.map((vendor) => (
                    <TableRow key={vendor.id}>
                      <TableCell className="font-medium">
                        {displayName(vendor)}
                      </TableCell>
                      <TableCell>{vendor.email || "—"}</TableCell>
                      <TableCell>
                        <span
                          className={
                            vendor.isActive
                              ? "text-green-600"
                              : "text-muted-foreground"
                          }
                        >
                          {vendor.isActive ? "Active" : "Inactive"}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDateTime(vendor.dateJoined)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {(pageInfo?.hasNextPage || pageInfo?.hasPreviousPage) && (
                <div className="border-t px-4 py-3">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handlePrevPage}
                          disabled={!pageInfo?.hasPreviousPage}
                        >
                          <PaginationPrevious label="Previous page" />
                        </Button>
                      </PaginationItem>
                      <PaginationItem>
                        <span className="px-4 text-sm text-muted-foreground">
                          {totalCount} total
                        </span>
                      </PaginationItem>
                      <PaginationItem>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleNextPage}
                          disabled={!pageInfo?.hasNextPage}
                        >
                          <PaginationNext label="Next page" />
                        </Button>
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
