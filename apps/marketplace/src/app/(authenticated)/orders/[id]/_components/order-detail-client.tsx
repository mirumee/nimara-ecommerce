"use client";

import { ArrowLeft, Check, ChevronDown, MoreHorizontal } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@nimara/ui/components/button";
import { Card, CardContent, CardTitle } from "@nimara/ui/components/card";
import { Checkbox } from "@nimara/ui/components/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@nimara/ui/components/dialog";
import { Input } from "@nimara/ui/components/input";
import { Label } from "@nimara/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@nimara/ui/components/select";
import { useToast } from "@nimara/ui/hooks";

import { OrderNotes } from "@/components/order-notes";
import { OrderTimeline } from "@/components/order-timeline";
import { ColorBadge } from "@/components/ui/color-badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type {
  Order_Query,
  OrderCancel_Mutation,
  OrderFulfill_Mutation,
} from "@/graphql/generated/client";
import { formatPrice } from "@/lib/utils";

import { cancelFulfillment, cancelOrder, fulfillOrder } from "../actions";

type LineInputMap = Record<
  string,
  {
    quantity: number;
    warehouse_id: string;
  }
>;

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

function addressesAreEqual(a?: Address | null, b?: Address | null): boolean {
  if (!a || !b) {
    return false;
  }

  return (
    a.firstName === b.firstName &&
    a.lastName === b.lastName &&
    a.streetAddress1 === b.streetAddress1 &&
    a.streetAddress2 === b.streetAddress2 &&
    a.city === b.city &&
    a.postalCode === b.postalCode &&
    a.country?.code === b.country?.code &&
    a.phone === b.phone
  );
}

function formatAddress(address?: Address | null): string {
  if (!address) { return "No address provided"; }

  const parts = [
    [address.firstName, address.lastName].filter(Boolean).join(" "),
    address.streetAddress1,
    address.streetAddress2,
    [address.postalCode, address.city].filter(Boolean).join(" "),
    address.country?.country,
  ].filter(Boolean);

  return parts.join(", ");
}

interface OrderDetailClientProps {
  order: NonNullable<Order_Query["order"]>;
  warehouses: Array<{ id: string; name: string }>;
}

export function OrderDetailClient({
  order,
  warehouses,
}: OrderDetailClientProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [isFulfilling, setIsFulfilling] = useState(false);
  const [fulfillmentData, setFulfillmentData] = useState<LineInputMap>({});
  const [trackingNumber, setTrackingNumber] = useState("");
  const [notifyCustomer, setNotifyCustomer] = useState(false);
  const [isPendingFulfillment, setIsPendingFulfillment] = useState(false);
  const [showCancelOrderDialog, setShowCancelOrderDialog] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelingFulfillmentId, setCancelingFulfillmentId] = useState<
    string | null
  >(null);
  const [cancelFulfillmentTarget, setCancelFulfillmentTarget] = useState<{
    fulfillmentId: string;
    warehouseId: string;
  } | null>(null);

  const fulfillmentLines = Object.entries(fulfillmentData)
    .filter(([, v]) => v.quantity > 0 && v.warehouse_id)
    .map(([orderLineId, v]) => ({
      orderLineId,
      stocks: [{ quantity: v.quantity, warehouse: v.warehouse_id }],
    }));

  const handleCompleteFulfillment = async () => {
    setIsPendingFulfillment(true);

    try {
      const result = await fulfillOrder({
        order: order.id,
        input: {
          lines: fulfillmentLines,
          notifyCustomer,
          trackingNumber: trackingNumber || undefined,
        },
      });

      if (!result.ok) {
        const message = result.errors
          .map((e: { message?: string | null }) => e.message || "Unknown error")
          .join(", ");

        toast({
          title: "Failed to fulfill order",
          description: message,
          variant: "destructive",
        });

        return;
      }

      const fulfillData = result.data as unknown as OrderFulfill_Mutation;
      const errors = fulfillData?.orderFulfill?.errors ?? [];

      if (errors.length > 0) {
        const message = errors
          .map((e: { message: string | null }) => e.message)
          .filter(Boolean)
          .join(", ");

        toast({
          title: "Failed to fulfill order",
          description: message || "Unknown error",
          variant: "destructive",
        });

        return;
      }
      toast({
        title: "Order fulfilled",
        description: "Successfully fulfilled order.",
      });
      setFulfillmentData({});
      setIsFulfilling(false);
      setTrackingNumber("");
      setNotifyCustomer(false);
      router.refresh();
    } catch (error) {
      toast({
        title: "Failed to fulfill order",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsPendingFulfillment(false);
    }
  };

  const handleCancelFulfillmentById = async (
    fulfillmentId: string,
    warehouseId: string
  ) => {
    setCancelingFulfillmentId(fulfillmentId);

    try {
      const result = await cancelFulfillment(
        { id: fulfillmentId, input: { warehouseId } },
        order.id
      );

      if (!result.ok) {
        const message = result.errors
          .map((e: { message?: string | null }) => e.message || "Unknown error")
          .join(", ");

        toast({
          title: "Failed to cancel fulfillment",
          description: message,
          variant: "destructive",
        });

        return;
      }

      const errors = result.data?.orderFulfillmentCancel?.errors ?? [];

      if (errors.length > 0) {
        const message = errors
          .map((e: { message: string | null }) => e.message)
          .filter(Boolean)
          .join(", ");

        toast({
          title: "Failed to cancel fulfillment",
          description: message || "Unknown error",
          variant: "destructive",
        });

        return;
      }

      toast({
        title: "Fulfillment canceled",
        description: "The fulfillment was canceled successfully.",
      });

      setCancelFulfillmentTarget(null);
      router.refresh();
    } catch (error) {
      toast({
        title: "Failed to cancel fulfillment",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setCancelingFulfillmentId(null);
    }
  };

  const handleCancelOrder = async () => {
    setIsCancelling(true);

    try {
      const result = await cancelOrder({ id: order.id });

      if (!result) {
        toast({
          title: "Order cancel failed",
          description: "No response from server. Please try again.",
          variant: "destructive",
        });

        return;
      }

      if (!result.ok) {
        const message = (result.errors ?? [])
          .map((e: { message?: string | null }) => e?.message || "Unknown error")
          .join(", ");

        toast({
          title: "Order cancel failed",
          description: message || "Something went wrong.",
          variant: "destructive",
        });

        return;
      }

      const cancelPayload = (result.data as unknown as OrderCancel_Mutation)?.orderCancel;

      if (cancelPayload?.errors?.length) {
        const messages = cancelPayload.errors
          .map((e: { message: string | null }) => e.message)
          .filter(Boolean)
          .join(", ");

        toast({
          title: "Order cancel failed",
          description: messages || "Unknown error",
          variant: "destructive",
        });
      } else {
        setShowCancelOrderDialog(false);
        toast({
          title: "Order canceled",
          description: "The order was canceled successfully.",
        });
        router.push("/orders");
      }
    } catch (error) {
      console.error("Order cancel error:", error);
      toast({
        title: "Order cancel failed",
        description: error instanceof Error ? error.message : "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCancelling(false);
    }
  };

  const isSameAddress = addressesAreEqual(
    order.billingAddress,
    order.shippingAddress
  );

  const unfulfilledLines = order.lines?.filter(
    (line) => line.quantityToFulfill && line.quantityToFulfill > 0
  ) ?? [];

  const fulfilledLines = order.lines?.filter(
    (line) => line.quantityFulfilled > 0
  ) ?? [];

  const customerPhone =
    order.shippingAddress?.phone ?? order.billingAddress?.phone ?? null;

  const itemCount = order.lines?.length ?? 0;
  const itemLabel = itemCount === 1 ? "item" : "items";

  const handlePrintPackingSlips = () => {
    console.log("Print packing slips");
  };

  const handleMessageCustomer = () => {
    console.log("Message customer");
  };

  const handleRefund = () => {
    console.log("Refund");
  };

  return (
    <div className="min-h-screen">
      {/* Sticky header bar */}
      <div className="bg-background fixed top-16 left-0 right-0 z-40 border-b">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="sm" className="gap-2">
              <Link href="/orders">
                <ArrowLeft className="h-4 w-4" />
                All orders
              </Link>
            </Button>
            <h1 className="text-2xl font-semibold">{order.number}</h1>
            <ColorBadge label={order.status} />
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                >
                  More actions
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {order.status !== "CANCELED" && (
                  <DropdownMenuItem onClick={() => setShowCancelOrderDialog(true)}>
                    Cancel order
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={handlePrintPackingSlips}>
                  Print packing slips
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleMessageCustomer}>
                  Message customer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              size="sm"
              variant="outline"
              onClick={handleRefund}
            >
              Refund
            </Button>
          </div>
        </div>
      </div>

      {/* Main content: offset below sticky bar */}
      <div className="mx-auto mt-20 w-2/3 max-w-none px-6 pb-6">
        <div className="space-y-6">
          {/* Customer information */}
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
                <div>
                  <h3 className="mb-2 text-sm font-medium text-muted-foreground">
                    Customer name
                  </h3>
                  <p className="font-medium">
                    {[order.user?.firstName, order.user?.lastName]
                      .filter(Boolean)
                      .join(" ") || order.userEmail || "Guest"}
                  </p>
                </div>
                <div>
                  <h3 className="mb-2 text-sm font-medium text-muted-foreground">
                    Contact information
                  </h3>
                  <p className="text-sm">{order.userEmail ?? "—"}</p>
                  {customerPhone && (
                    <p className="text-sm">{customerPhone}</p>
                  )}
                </div>
                <div>
                  <h3 className="mb-2 text-sm font-medium text-muted-foreground">
                    Shipping address
                  </h3>
                  <div className="text-sm">
                    {order.shippingAddress
                      ? formatAddress(order.shippingAddress)
                      : "No shipping address"}
                  </div>
                </div>
                <div>
                  <h3 className="mb-2 text-sm font-medium text-muted-foreground">
                    Billing address
                  </h3>
                  <div className="text-sm text-muted-foreground">
                    {isSameAddress
                      ? "(Same as shipping)"
                      : order.billingAddress
                        ? formatAddress(order.billingAddress)
                        : "No billing address"}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          {/* Items card: Fulfilled + Unfulfilled */}
          <Card>
            <CardContent className="p-0">
              {fulfilledLines.length > 0 && (
                <div className="border-b">
                  <div className="flex items-center justify-between bg-muted/20 px-6 py-4">
                    <CardTitle className="text-base font-medium">
                      Fulfilled ({fulfilledLines.length})
                    </CardTitle>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => console.log("View tracking")}>
                          View tracking
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => console.log("Print shipping label")}>
                          Print shipping label
                        </DropdownMenuItem>
                        {order.fulfillments
                          ?.filter(
                            (f) =>
                              f.status !== "CANCELED" && f.warehouse?.id
                          )
                          .map((f, idx) => (
                            <DropdownMenuItem
                              key={f.id}
                              className="text-red-600 focus:text-red-600"
                              onClick={() =>
                                f.warehouse &&
                                setCancelFulfillmentTarget({
                                  fulfillmentId: f.id,
                                  warehouseId: f.warehouse.id,
                                })
                              }
                            >
                              Cancel fulfillment
                              {(order.fulfillments?.length ?? 0) > 1
                                ? ` #${idx + 1}`
                                : ""}
                            </DropdownMenuItem>
                          ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="space-y-4 px-6 py-4">
                    {fulfilledLines.map((line) => (
                      <div
                        key={line.id}
                        className="flex items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-3">
                          {line.thumbnail?.url ? (
                            <Image
                              src={line.thumbnail.url}
                              alt={line.productName || ""}
                              width={48}
                              height={48}
                              className="rounded border object-cover"
                              unoptimized
                            />
                          ) : (
                            <div className="h-12 w-12 shrink-0 rounded border bg-muted" />
                          )}
                          <div>
                            <p className="font-medium">{line.productName}</p>
                            {line.variantName && (
                              <p className="text-sm text-muted-foreground">
                                {line.variantName}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-muted-foreground">
                            {formatPrice(line.unitPrice.gross.amount, line.unitPrice.gross.currency)} × {line.quantityFulfilled}
                          </span>
                          <span className="font-medium">
                            {formatPrice(
                              line.unitPrice.gross.amount * line.quantityFulfilled,
                              line.unitPrice.gross.currency
                            )}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {unfulfilledLines.length > 0 && (
                <div>
                  <div className="flex items-center justify-between bg-muted/20 px-6 py-4">
                    <CardTitle className="text-base font-medium">
                      {!isFulfilling
                        ? `Unfulfilled (${unfulfilledLines.length})`
                        : "Fulfilling items"}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      {order.status !== "CANCELED" && (
                        !isFulfilling ? (
                          <>
                            <Button
                              size="sm"
                              className="bg-stone-900 hover:bg-stone-800"
                              onClick={() => setIsFulfilling(true)}
                            >
                              Fulfill items
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => console.log("Create shipping label")}>
                                  Create shipping label
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setIsFulfilling(false);
                              setFulfillmentData({});
                              setTrackingNumber("");
                              setNotifyCustomer(false);
                            }}
                          >
                            Cancel
                          </Button>
                        ))}
                    </div>
                  </div>
                  <div className="space-y-4 px-6 py-4">
                    {unfulfilledLines.map((line) => (
                      <div
                        key={line.id}
                        className="flex items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-3">
                          {line.thumbnail?.url ? (
                            <Image
                              src={line.thumbnail.url}
                              alt={line.productName || ""}
                              width={48}
                              height={48}
                              className="rounded border object-cover"
                              unoptimized
                            />
                          ) : (
                            <div className="h-12 w-12 shrink-0 rounded border bg-muted" />
                          )}
                          <div>
                            <p className="font-medium">{line.productName}</p>
                            {line.variantName && (
                              <p className="text-sm text-muted-foreground">
                                {line.variantName}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          {isFulfilling ? (
                            <div className="flex items-center gap-2">
                              <Select
                                value={fulfillmentData[line.id]?.warehouse_id ?? ""}
                                onValueChange={(value) =>
                                  setFulfillmentData((prev) => ({
                                    ...prev,
                                    [line.id]: {
                                      ...prev[line.id],
                                      warehouse_id: value,
                                    },
                                  }))
                                }
                              >
                                <SelectTrigger className="w-[200px]">
                                  <SelectValue placeholder="Select warehouse" />
                                </SelectTrigger>
                                <SelectContent>
                                  {warehouses.map((w) => (
                                    <SelectItem key={w.id} value={w.id}>
                                      {w.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <Input
                                type="number"
                                min={0}
                                max={line.quantityToFulfill ?? 0}
                                className="w-16 text-center"
                                value={fulfillmentData[line.id]?.quantity ?? ""}
                                onChange={(e) =>
                                  setFulfillmentData((prev) => ({
                                    ...prev,
                                    [line.id]: {
                                      ...prev[line.id],
                                      quantity: parseInt(e.target.value) || 0,
                                    },
                                  }))
                                }
                              />
                              <span className="text-muted-foreground text-sm">
                                of {line.quantityToFulfill}
                              </span>
                            </div>
                          ) : (
                            <>
                              <span className="text-sm text-muted-foreground">
                                {formatPrice(line.unitPrice.gross.amount, line.unitPrice.gross.currency)} × {line.quantityToFulfill}
                              </span>
                              <span className="font-medium">
                                {formatPrice(
                                  (line.unitPrice.gross.amount ?? 0) * (line.quantityToFulfill ?? 0),
                                  line.unitPrice.gross.currency
                                )}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Fulfillment form */}
                  {isFulfilling && (
                    <div className="space-y-4 border-t px-6 py-4">
                      <h4 className="font-medium">Tracking information</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="tracking">Tracking number</Label>
                          <Input
                            id="tracking"
                            value={trackingNumber}
                            onChange={(e) => setTrackingNumber(e.target.value)}
                            placeholder="Enter tracking number"
                          />
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id="notify"
                            checked={notifyCustomer}
                            onCheckedChange={(checked) =>
                              setNotifyCustomer(checked === true)
                            }
                          />
                          <Label htmlFor="notify">
                            Send a notification to the customer
                          </Label>
                        </div>
                        <Button
                          className="bg-stone-900 hover:bg-stone-800"
                          onClick={handleCompleteFulfillment}
                          disabled={
                            fulfillmentLines.length === 0 || isPendingFulfillment
                          }
                        >
                          {isPendingFulfillment ? "Fulfilling..." : "Fulfill items"}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {unfulfilledLines.length === 0 && fulfilledLines.length === 0 && (
                <div className="px-6 py-8 text-center text-sm text-muted-foreground">
                  No line items
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order summary */}
          <Card>
            <CardContent className="p-6">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <div className="text-right">
                    <span className="text-muted-foreground">
                      {itemCount} {itemLabel}
                    </span>
                    <div>
                      {formatPrice(order.subtotal.gross.amount, order.subtotal.gross.currency)}
                    </div>
                  </div>
                </div>
                {order.shippingPrice && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <div className="text-right">
                      <span className="text-muted-foreground">—</span>
                      <div>
                        {formatPrice(
                          order.shippingPrice.gross.amount,
                          order.shippingPrice.gross.currency
                        )}
                      </div>
                    </div>
                  </div>
                )}
                <div className="flex justify-between border-t pt-3 text-base font-semibold">
                  <span>Total</span>
                  <span>
                    {formatPrice(order.total.gross.amount, order.total.gross.currency)}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t pt-3">
                  <div className="flex items-center gap-2">
                    {order.paymentStatus === "FULLY_CHARGED" ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : null}
                    <span
                      className={
                        order.paymentStatus === "FULLY_CHARGED"
                          ? "text-green-600"
                          : "text-muted-foreground"
                      }
                    >
                      {order.paymentStatus === "FULLY_CHARGED" ? "Paid" : order.paymentStatusDisplay ?? "Payment"}
                    </span>
                  </div>
                  <span>
                    {formatPrice(order.total.gross.amount, order.total.gross.currency)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bottom content - 2 columns */}
          <div className="grid grid-cols-2 gap-6">
            {/* Timeline */}
            <OrderTimeline events={order.events || []} currency={order.total.gross.currency} />

            {/* Order notes */}
            <OrderNotes
              orderId={order.id}
              events={order.events || []}
              onNoteAdded={() => router.refresh()}
            />
          </div>

        </div>
      </div>

      {/* Cancel order dialog */}
      <Dialog open={showCancelOrderDialog} onOpenChange={setShowCancelOrderDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Order</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this order? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCancelOrderDialog(false)}
            >
              No, keep order
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelOrder}
              disabled={isCancelling}
            >
              {isCancelling ? "Canceling..." : "Yes, cancel order"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel fulfillment dialog */}
      <Dialog
        open={!!cancelFulfillmentTarget}
        onOpenChange={(open) => !open && setCancelFulfillmentTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Fulfillment</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this fulfillment?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCancelFulfillmentTarget(null)}
            >
              No
            </Button>
            <Button
              variant="destructive"
              disabled={!!cancelingFulfillmentId}
              onClick={() => {
                if (cancelFulfillmentTarget) {
                  void handleCancelFulfillmentById(
                    cancelFulfillmentTarget.fulfillmentId,
                    cancelFulfillmentTarget.warehouseId
                  );
                }
              }}
            >
              {cancelingFulfillmentId ? "Canceling..." : "Yes, cancel"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
