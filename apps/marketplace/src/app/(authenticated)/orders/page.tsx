"use client";

import { Filter, Loader2, Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import type {
  OrderFilterInput,
  OrderStatusFilter,
  PaymentChargeStatusEnum,
} from "@nimara/codegen/schema";
import { Button } from "@nimara/ui/components/button";
import { Card, CardContent } from "@nimara/ui/components/card";
import { Checkbox } from "@nimara/ui/components/checkbox";
import { Input } from "@nimara/ui/components/input";
import { Label } from "@nimara/ui/components/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@nimara/ui/components/popover";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { OrdersDocument } from "@/graphql/queries/generated";
import { useDebounce } from "@/hooks/use-debounce";
import { useGraphQLQuery } from "@/hooks/use-graphql-query";
import { formatDateTime, formatPrice } from "@/lib/utils";

const fulfillmentStatusColors: Record<string, string> = {
  UNFULFILLED: "bg-yellow-100 text-yellow-700",
  PARTIALLY_FULFILLED: "bg-blue-100 text-blue-700",
  FULFILLED: "bg-green-100 text-green-700",
  CANCELED: "bg-red-100 text-red-700",
  RETURNED: "bg-gray-100 text-gray-700",
};

const paymentStatusColors: Record<string, string> = {
  NOT_CHARGED: "bg-gray-100 text-gray-700",
  PENDING: "bg-yellow-100 text-yellow-700",
  PARTIALLY_CHARGED: "bg-blue-100 text-blue-700",
  FULLY_CHARGED: "bg-green-100 text-green-700",
  PARTIALLY_REFUNDED: "bg-blue-100 text-blue-700",
  FULLY_REFUNDED: "bg-gray-100 text-gray-700",
};

const PAYMENT_STATUS_OPTIONS: PaymentChargeStatusEnum[] = [
  "NOT_CHARGED",
  "PENDING",
  "FULLY_CHARGED",
  "PARTIALLY_REFUNDED",
  "FULLY_REFUNDED",
];

const FULFILLMENT_STATUS_OPTIONS: OrderStatusFilter[] = [
  "UNFULFILLED",
  "PARTIALLY_FULFILLED",
  "FULFILLED",
  "CANCELED",
];

export default function OrdersPage() {
  const [searchValue, setSearchValue] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<
    PaymentChargeStatusEnum[]
  >([]);
  const [fulfillmentStatusFilter, setFulfillmentStatusFilter] = useState<
    OrderStatusFilter[]
  >([]);
  const debouncedSearch = useDebounce(searchValue, 300);

  const orderFilter = useMemo((): OrderFilterInput | undefined => {
    const filter: OrderFilterInput = {};

    if (paymentStatusFilter.length > 0) {
      filter.paymentStatus = paymentStatusFilter;
    }
    if (fulfillmentStatusFilter.length > 0) {
      filter.status = fulfillmentStatusFilter;
    }
    if (debouncedSearch?.trim()) {
      filter.search = debouncedSearch.trim();
    }

    return Object.keys(filter).length > 0 ? filter : undefined;
  }, [
    paymentStatusFilter,
    fulfillmentStatusFilter,
    debouncedSearch,
  ]);

  const { data, isLoading } = useGraphQLQuery(OrdersDocument, {
    variables: { first: 20, filter: orderFilter },
  });

  const orders = data?.orders?.edges?.map((e) => e.node) || [];
  const activeFilterCount =
    paymentStatusFilter.length + fulfillmentStatusFilter.length;

  const togglePaymentStatus = (value: PaymentChargeStatusEnum) => {
    setPaymentStatusFilter((prev) =>
      prev.includes(value) ? prev.filter((s) => s !== value) : [...prev, value]
    );
  };

  const toggleFulfillmentStatus = (value: OrderStatusFilter) => {
    setFulfillmentStatusFilter((prev) =>
      prev.includes(value) ? prev.filter((s) => s !== value) : [...prev, value]
    );
  };

  const clearAllFilters = () => {
    setPaymentStatusFilter([]);
    setFulfillmentStatusFilter([]);
  };

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Orders</h2>
        <Button type="button" disabled>
          Add order
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="flex p-4">
            <div className="relative">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
              <Input
                placeholder="Search"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="w-64 pl-9"
              />
            </div>
            <div className="flex grow" />
            <div className="m-2 flex items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="gap-2 bg-transparent">
                    <Filter className="h-4 w-4" />
                    Filter
                    {activeFilterCount > 0 && (
                      <span className="text-muted-foreground">
                        ({activeFilterCount})
                      </span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="min-w-[280px]" align="end">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">Filter</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearAllFilters}
                        className="h-auto py-1 text-xs"
                      >
                        Clear all
                      </Button>
                    </div>
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium">Payment status</h4>
                      <div className="space-y-2">
                        {PAYMENT_STATUS_OPTIONS.map((status) => (
                          <div
                            key={status}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={`payment-${status}`}
                              checked={paymentStatusFilter.includes(status)}
                              onCheckedChange={() => togglePaymentStatus(status)}
                            />
                            <Label
                              htmlFor={`payment-${status}`}
                              className="cursor-pointer text-sm font-normal"
                            >
                              {status.replace(/_/g, " ")}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium">Fulfillment status</h4>
                      <div className="space-y-2">
                        {FULFILLMENT_STATUS_OPTIONS.map((status) => (
                          <div
                            key={status}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={`fulfillment-${status}`}
                              checked={fulfillmentStatusFilter.includes(status)}
                              onCheckedChange={() =>
                                toggleFulfillmentStatus(status)
                              }
                            />
                            <Label
                              htmlFor={`fulfillment-${status}`}
                              className="cursor-pointer text-sm font-normal"
                            >
                              {status.replace(/_/g, " ")}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground">No orders found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-t px-6 py-4">
                  <TableHead>Order No.</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Payment status</TableHead>
                  <TableHead>Fulfillment status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <Link
                        href={`/orders/${order.id}`}
                        className="font-medium hover:underline"
                      >
                        #{order.number}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {order.created != null
                        ? formatDateTime(order.created as string)
                        : "—"}
                    </TableCell>
                    <TableCell>
                      {order.user
                        ? `${order.user.firstName ?? ""} ${order.user.lastName ?? ""}`.trim() || order.user.email
                        : "Guest"}
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatPrice(
                        order.total.gross.amount as number,
                        order.total.gross.currency as string
                      )}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${paymentStatusColors[order.paymentStatus] ?? "bg-gray-100 text-gray-700"}`}
                      >
                        {String(order.paymentStatus).replace(/_/g, " ")}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${fulfillmentStatusColors[order.status] || "bg-gray-100 text-gray-700"}`}
                      >
                        {order.status.replace(/_/g, " ")}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
