"use client";

import { ArrowLeft, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";

import { Button } from "@nimara/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@nimara/ui/components/card";

import { OrderDocument } from "@/graphql/queries/generated";
import { useGraphQLQuery } from "@/hooks/use-graphql-query";
import { formatDateTime, formatPrice } from "@/lib/utils";

interface Address {
  city?: string | null;
  country?: { code: string; country: string } | null;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  postalCode?: string | null;
  streetAddress1?: string | null;
  streetAddress2?: string | null;
}

function AddressCard({ title, address }: { address?: Address, title: string; }) {
  if (!address) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No address</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">{title}</CardTitle>
      </CardHeader>
      <CardContent className="text-sm">
        <p className="font-medium">
          {address.firstName} {address.lastName}
        </p>
        <p>{address.streetAddress1}</p>
        {address.streetAddress2 && <p>{address.streetAddress2}</p>}
        <p>
          {address.city}, {address.postalCode}
        </p>
        <p>{address.country?.country}</p>
        {address.phone && <p className="mt-2">{address.phone}</p>}
      </CardContent>
    </Card>
  );
}

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params.id as string;

  const { data, isLoading, error } = useGraphQLQuery(OrderDocument, {
    variables: { id: orderId },
    enabled: !!orderId,
  });

  const order = data?.order;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="space-y-4">
        <Button asChild variant="ghost">
          <Link href="/orders">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Orders
          </Link>
        </Button>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              {error ? "Failed to load order" : "Order not found"}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Order header: back, title + date, actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="sm" className="gap-2">
            <Link href="/orders">
              <ArrowLeft className="h-4 w-4" />
              All orders
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">Order #{order.number}</h1>
            <p className="text-sm text-muted-foreground">
              {order.created != null
                ? formatDateTime(String(order.created))
                : "—"}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            Cancel Order
          </Button>
          <Button size="sm" className="bg-stone-900 hover:bg-stone-800">
            Fulfill Order
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.lines.map((line) => (
                  <div
                    key={line.id}
                    className="flex items-center justify-between gap-4 border-b pb-4 last:border-0 last:pb-0"
                  >
                    <div className="flex items-center gap-3">
                      {line.thumbnail?.url ? (
                        <Image
                          width={48}
                          height={48}
                          src={line.thumbnail.url}
                          alt={line.thumbnail.alt || line.productName}
                          className="h-12 w-12 rounded-lg border object-cover"
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-lg border bg-muted" />
                      )}
                      <div>
                        <p className="font-medium">{line.productName}</p>
                        <p className="text-muted-foreground text-sm">
                          {[line.variantName, line.productSku && `SKU: ${line.productSku}`]
                            .filter(Boolean)
                            .join(", ")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-right">
                      <span className="text-sm text-muted-foreground">
                        {line.quantity} ×{" "}
                        {formatPrice(
                          Number(line.unitPrice.gross.amount),
                          String(line.unitPrice.gross.currency)
                        )}
                      </span>
                      <span className="font-medium">
                        {formatPrice(
                          Number(line.totalPrice.gross.amount),
                          String(line.totalPrice.gross.currency)
                        )}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Addresses */}
          <div className="grid gap-4 md:grid-cols-2">
            <AddressCard
              title="Shipping Address"
              address={order.shippingAddress ?? undefined}
            />
            <AddressCard
              title="Billing Address"
              address={order.billingAddress ?? undefined}
            />
          </div>
        </div>

        <div className="space-y-6">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <div className="text-right">
                  <span className="text-muted-foreground text-sm">
                    {order.lines.length} item{order.lines.length !== 1 ? "s" : ""}
                  </span>
                  <div>
                    {formatPrice(
                      Number(order.subtotal.gross.amount),
                      String(order.subtotal.gross.currency)
                    )}
                  </div>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <div className="text-right">
                  <div>
                    {formatPrice(
                      Number(order.shippingPrice.gross.amount),
                      String(order.shippingPrice.gross.currency)
                    )}
                  </div>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Tax <span className="text-xs">(included)</span>
                </span>
                <div className="text-right">
                  {formatPrice(
                    Number(order.total.tax.amount),
                    String(order.total.tax.currency)
                  )}
                </div>
              </div>
              <div className="flex justify-between border-t pt-3 text-lg font-semibold">
                <span>Total</span>
                <span>
                  {formatPrice(
                    Number(order.total.gross.amount),
                    String(order.total.gross.currency)
                  )}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Customer */}
          <Card>
            <CardHeader>
              <CardTitle>Customer</CardTitle>
            </CardHeader>
            <CardContent>
              {order.user ? (
                <div>
                  <p className="font-medium">
                    {order.user.firstName} {order.user.lastName}
                  </p>
                  <p className="text-sm text-muted-foreground">{order.user.email}</p>
                </div>
              ) : (
                <p className="text-muted-foreground">Guest checkout</p>
              )}
            </CardContent>
          </Card>

          {/* Status */}
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Order Status</span>
                <span className="font-medium">
                  {order.status.replace(/_/g, " ")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment Status</span>
                <span className="font-medium">
                  {order.paymentStatus.replace(/_/g, " ")}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
