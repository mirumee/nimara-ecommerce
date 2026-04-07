"use client";

import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";

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
import type { VendorCustomerWithOrders } from "@/services/vendor-customers";

const DEFAULT_PAGE_SIZE = 15;
const PAGE_SIZE_OPTIONS = [15, 25, 50];

function getCustomerName(customer: VendorCustomerWithOrders): string {
  const name = `${customer.firstName} ${customer.lastName}`.trim();

  return name || customer.email;
}

export function CustomersListClient({
  customers,
}: {
  customers: VendorCustomerWithOrders[];
}) {
  const t = useTranslations();
  const [searchValue, setSearchValue] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const normalizedSearch = searchValue.trim().toLowerCase();
  const filteredCustomers = useMemo(() => {
    if (!normalizedSearch) {
      return customers;
    }

    return customers.filter((customer) => {
      const fullName = `${customer.firstName} ${customer.lastName}`
        .trim()
        .toLowerCase();
      const email = customer.email.toLowerCase();

      return (
        fullName.includes(normalizedSearch) || email.includes(normalizedSearch)
      );
    });
  }, [customers, normalizedSearch]);
  const totalPages = Math.max(
    1,
    Math.ceil(filteredCustomers.length / pageSize),
  );
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const hasNextPage = safeCurrentPage < totalPages;
  const hasPreviousPage = safeCurrentPage > 1;
  const paginatedCustomers = filteredCustomers.slice(
    (safeCurrentPage - 1) * pageSize,
    safeCurrentPage * pageSize,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [normalizedSearch]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const handlePageSizeChange = (newSize: string) => {
    setPageSize(parseInt(newSize, 10));
    setCurrentPage(1);
  };

  const handleNextPage = () => {
    if (!hasNextPage) {
      return;
    }

    setCurrentPage((prev) => prev + 1);
  };

  const handlePreviousPage = () => {
    if (!hasPreviousPage) {
      return;
    }

    setCurrentPage((prev) => prev - 1);
  };

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">{t("common.customers")}</h2>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="flex p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t("marketplace.customers.search-placeholder")}
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="w-64 pl-9"
              />
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow className="border-t px-6 py-4">
                <TableHead>{t("common.name")}</TableHead>
                <TableHead>{t("common.email")}</TableHead>
                <TableHead>
                  {t("marketplace.customers.table-orders-count")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center">
                    {t("marketplace.customers.no-customers-found")}
                  </TableCell>
                </TableRow>
              ) : filteredCustomers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center">
                    {t("marketplace.customers.no-matching")}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedCustomers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>{getCustomerName(customer)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {customer.email}
                    </TableCell>
                    <TableCell>{customer.ordersCount}</TableCell>
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
