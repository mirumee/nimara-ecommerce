"use client";

import { Search } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@nimara/ui/components/button";
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
import { cn, formatDateTime } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";
import { type VendorProfile, vendorsService } from "@/services/vendors";

type Props = {
  isAuthenticated: boolean;
  isLoading: boolean;
};

const VENDOR_STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "active", label: "Active" },
  { value: "rejected", label: "Rejected" },
] as const;

const STATUS_FILTER_OPTIONS = [
  { value: "all", label: "All statuses" },
  ...VENDOR_STATUS_OPTIONS,
] as const;

function getAttributeValue(
  profile: VendorProfile,
  slug: string,
): string | null {
  const attr = profile.assignedAttributes?.find(
    (a) => a.attribute?.slug === slug,
  );

  if (!attr) {
    return null;
  }

  if (attr.plainTextValue != null) {
    return attr.plainTextValue;
  }

  return attr.choiceValue?.name ?? null;
}

function getAttributeId(profile: VendorProfile, slug: string): string | null {
  const attr = profile.assignedAttributes?.find(
    (a) => a.attribute?.slug === slug,
  );

  return attr?.attribute?.id ?? null;
}

function statusTextColor(value: string): string {
  switch (value.toLowerCase()) {
    case "active":
      return "text-green-600 dark:text-green-400";
    case "rejected":
      return "text-red-600 dark:text-red-400";
    default:
      return "text-muted-foreground";
  }
}

function VendorStatusSelect({
  disabled,
  onStatusChange,
  value,
  vendor,
}: {
  disabled: boolean;
  onStatusChange: (vendor: VendorProfile, newValue: string) => void;
  value: string;
  vendor: VendorProfile;
}) {
  const normalizedValue = value.toLowerCase();
  const isLocked =
    normalizedValue === "active" || normalizedValue === "rejected";

  return (
    <Select
      value={normalizedValue}
      onValueChange={(v) => onStatusChange(vendor, v)}
      disabled={disabled || isLocked}
    >
      <SelectTrigger
        className={cn("w-[120px]", statusTextColor(normalizedValue))}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {VENDOR_STATUS_OPTIONS.map((opt) => (
          <SelectItem
            key={opt.value}
            value={opt.value}
            className={statusTextColor(opt.value)}
          >
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function AppVendorsTab({ isAuthenticated, isLoading }: Props) {
  const { dashboardContext } = useAuth();
  const [vendors, setVendors] = useState<VendorProfile[]>([]);
  const [pageInfo, setPageInfo] = useState<{
    endCursor: string | null;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    startCursor: string | null;
  } | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [cursor, setCursor] = useState<{ after?: string; before?: string }>({});
  const [updatingStatusFor, setUpdatingStatusFor] = useState<string | null>(
    null,
  );

  const fetchVendors = useCallback(
    async (params?: { after?: string; before?: string; search?: string }) => {
      if (!isAuthenticated) {
        return;
      }

      setLoading(true);
      setError(null);

      const result = await vendorsService.getVendorProfiles(
        {
          first: params?.before ? undefined : 20,
          last: params?.before ? 20 : undefined,
          after: params?.after,
          before: params?.before,
          filter: params?.search ? { search: params.search } : undefined,
        },
        null,
      );

      setLoading(false);

      if (!result.ok) {
        setError("Failed to load vendor profiles");

        return;
      }

      const data = result.data.vendorProfiles;
      const nodes = data?.edges?.map((e) => e.node) ?? [];
      const pageInfo = data?.pageInfo ?? null;
      const totalCount = data?.totalCount ?? 0;

      /* eslint-disable @typescript-eslint/no-unsafe-argument -- vendorProfiles response */
      setVendors(nodes);
      setPageInfo(pageInfo);
      setTotalCount(totalCount);
      /* eslint-enable @typescript-eslint/no-unsafe-argument */
    },
    [isAuthenticated, dashboardContext],
  );

  useEffect(() => {
    if (isAuthenticated && !isLoading && dashboardContext) {
      void fetchVendors({ ...cursor, search: search || undefined });
    }
  }, [
    isAuthenticated,
    isLoading,
    dashboardContext,
    cursor.after,
    cursor.before,
    search,
    fetchVendors,
  ]);

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    setSearch((formData.get("search") as string)?.trim() || "");
    setCursor({});
  };

  const handlePrevPage = () => {
    if (!pageInfo?.hasPreviousPage || !pageInfo?.startCursor) {
      return;
    }
    setCursor({ before: pageInfo.startCursor });
  };

  const handleNextPage = () => {
    if (!pageInfo?.hasNextPage || !pageInfo?.endCursor) {
      return;
    }
    setCursor({ after: pageInfo.endCursor });
  };

  const handleStatusChange = async (
    vendor: VendorProfile,
    newValue: string,
  ) => {
    const attributeId = getAttributeId(vendor, "vendor-status");

    if (!attributeId) {
      return;
    }

    setUpdatingStatusFor(vendor.id);

    const result = await vendorsService.updateVendorStatus(
      vendor.id,
      attributeId,
      newValue,
      null,
    );

    setUpdatingStatusFor(null);

    if (result.ok && !result.data.pageUpdate.errors.length) {
      setVendors((prev) =>
        prev.map((v) =>
          v.id === vendor.id
            ? {
                ...v,
                assignedAttributes: v.assignedAttributes.map((a) =>
                  a.attribute.slug === "vendor-status"
                    ? {
                        ...a,
                        choiceValue: { name: newValue },
                      }
                    : a,
                ),
              }
            : v,
        ),
      );
    }
  };

  const displayName = (v: VendorProfile) =>
    getAttributeValue(v, "vendor-name") ?? v.title ?? "—";

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
        <p className="text-muted-foreground">
          Sign in to view the list of registered vendors.
        </p>
        <Button asChild>
          <Link href="/sign-in">Sign in</Link>
        </Button>
      </div>
    );
  }

  if (!dashboardContext) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
        <p className="text-muted-foreground">
          Open the app from Saleor dashboard to view vendor profiles.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <form onSubmit={handleSearchSubmit} className="relative w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            name="search"
            placeholder="Search by vendor name..."
            className="pl-9"
          />
        </form>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_FILTER_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : (
        (() => {
          const filtered = vendors.filter((v) => {
            if (statusFilter === "all") {
              return true;
            }

            const s = (
              getAttributeValue(v, "vendor-status") ?? ""
            ).toLowerCase();

            return s === statusFilter;
          });

          return filtered.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">
                {search || statusFilter !== "all"
                  ? "No vendors match your search and filters"
                  : "No vendors found"}
              </p>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Vendor Name</TableHead>
                      <TableHead>Vendor Model ID</TableHead>
                      <TableHead>Company Name</TableHead>
                      <TableHead>VAT ID</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[...filtered]
                      .sort((a, b) => {
                        const statusA = (
                          getAttributeValue(a, "vendor-status") ?? ""
                        ).toLowerCase();

                        const statusB = (
                          getAttributeValue(b, "vendor-status") ?? ""
                        ).toLowerCase();

                        if (statusA === "pending" && statusB !== "pending") {
                          return -1;
                        }

                        if (statusA !== "pending" && statusB === "pending") {
                          return 1;
                        }

                        return 0;
                      })
                      .map((vendor) => (
                        <TableRow key={vendor.id}>
                          <TableCell className="font-medium">
                            {displayName(vendor)}
                          </TableCell>
                          <TableCell className="font-mono text-xs text-muted-foreground">
                            {vendor.id}
                          </TableCell>
                          <TableCell>
                            {getAttributeValue(vendor, "company-name") ?? "—"}
                          </TableCell>
                          <TableCell>
                            {getAttributeValue(vendor, "vat-id") ?? "—"}
                          </TableCell>
                          <TableCell>
                            <VendorStatusSelect
                              vendor={vendor}
                              value={
                                getAttributeValue(vendor, "vendor-status") ??
                                "pending"
                              }
                              disabled={updatingStatusFor === vendor.id}
                              onStatusChange={handleStatusChange}
                            />
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {formatDateTime(String(vendor.created))}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>

              {(pageInfo?.hasNextPage || pageInfo?.hasPreviousPage) && (
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handlePrevPage}
                        disabled={!pageInfo?.hasPreviousPage}
                      >
                        <PaginationPrevious label="Previous" />
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
                        <PaginationNext label="Next" />
                      </Button>
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </>
          );
        })()
      )}
    </div>
  );
}
