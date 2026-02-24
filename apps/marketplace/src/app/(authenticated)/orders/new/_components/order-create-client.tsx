"use client";

import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@nimara/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@nimara/ui/components/card";
import {
  Dialog,
  DialogContent,
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

import { Textarea } from "@/components/ui/textarea";
import { ColorBadge } from "@/components/ui/color-badge";
import type {
  AddressInput,
  Channels,
  CustomerByEmail,
  DraftOrderCreateInput,
  OrderLineCreateInput,
} from "@/graphql/generated/client";
import { formatPrice } from "@/lib/utils";

import {
  createDraftOrder,
  completeDraftOrder,
  addInternalOrderNote,
  deleteDraftOrder,
  getChannelShippingMethods,
} from "../actions";
import {
  AddressManageDialog,
  type DraftAddress,
} from "./address-manage-dialog";
import { CustomerPickerDialog } from "./customer-picker-dialog";
import {
  type ShippingMethodOption,
  ShippingMethodPickerDialog,
} from "./shipping-method-picker-dialog";
import {
  type VariantLineDraft,
  VariantSelectionDialog,
} from "./variant-selection-dialog";

type Channel = NonNullable<Channels["channels"]>[number];

interface OrderCreateClientProps {
  channels: Channel[];
}

type CustomerNode = NonNullable<
  NonNullable<NonNullable<CustomerByEmail["customers"]>["edges"][number]>["node"]
>;

type SavedAddress = NonNullable<CustomerNode["addresses"]>[number];

function savedAddressToDraftAddress(address: SavedAddress): DraftAddress {
  return {
    firstName: address.firstName ?? "",
    lastName: address.lastName ?? "",
    companyName: address.companyName ?? undefined,
    streetAddress1: address.streetAddress1 ?? "",
    streetAddress2: address.streetAddress2 ?? undefined,
    city: address.city ?? "",
    cityArea: address.cityArea ?? undefined,
    postalCode: address.postalCode ?? "",
    countryArea: address.countryArea ?? undefined,
    phone: address.phone ?? undefined,
    countryCode: address.country?.code ?? "",
  };
}

function normalizeCountryCode(code: string): string {
  const upper = code.trim().toUpperCase();
  const map: Record<string, string> = { USA: "US", UK: "GB" };
  if (map[upper]) return map[upper];
  return upper.length > 2 ? upper.slice(0, 2) : upper;
}

function draftAddressToAddressInput(address: DraftAddress): AddressInput {
  const country = normalizeCountryCode(address.countryCode);

  return {
    firstName: address.firstName,
    lastName: address.lastName,
    companyName: address.companyName,
    streetAddress1: address.streetAddress1,
    streetAddress2: address.streetAddress2,
    city: address.city,
    cityArea: address.cityArea,
    postalCode: address.postalCode,
    countryArea: address.countryArea,
    phone: address.phone,
    country: country as AddressInput["country"],
  };
}

function customerDisplay(c: CustomerNode): string {
  const name = [c.firstName, c.lastName].filter(Boolean).join(" ").trim();
  return name ? `${name} <${c.email}>` : c.email;
}

function draftAddressSummary(a: DraftAddress): string {
  const isEmpty =
    !a.firstName?.trim() &&
    !a.lastName?.trim() &&
    !a.streetAddress1?.trim() &&
    !a.city?.trim() &&
    !a.postalCode?.trim();
  if (isEmpty) {
    return "";
  }

  const parts = [
    [a.firstName, a.lastName].filter(Boolean).join(" "),
    a.companyName,
    a.streetAddress1,
    a.streetAddress2,
    [a.postalCode, a.city].filter(Boolean).join(" "),
    a.countryCode,
  ].filter(Boolean);
  return parts.join(", ");
}

const EMPTY_ADDRESS: DraftAddress = {
  firstName: "",
  lastName: "",
  streetAddress1: "",
  city: "",
  postalCode: "",
  countryCode: "",
};

type OrderLine = VariantLineDraft & { isGift?: boolean };

export function OrderCreateClient({ channels }: OrderCreateClientProps) {
  const router = useRouter();
  const { toast } = useToast();

  const activeChannels = useMemo(
    () => channels.filter((c) => c.isActive),
    [channels],
  );

  // Channel selection (modal-first)
  const [channelId, setChannelId] = useState("");
  const [isChannelDialogOpen, setIsChannelDialogOpen] = useState(true);
  const [pendingChannelId, setPendingChannelId] = useState(
    activeChannels[0]?.id ?? "",
  );

  const selectedChannel = useMemo(
    () => activeChannels.find((c) => c.id === channelId) ?? null,
    [activeChannels, channelId],
  );

  const channelDefaultCountryCode = useMemo(() => {
    const raw =
      selectedChannel?.defaultCountry?.code ??
      selectedChannel?.countries?.[0]?.code ??
      "US";
    return normalizeCountryCode(raw);
  }, [selectedChannel?.countries, selectedChannel?.defaultCountry?.code]);

  // Customer
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerNode | null>(null);
  const [isCustomerDialogOpen, setIsCustomerDialogOpen] = useState(false);

  // Addresses
  const [billingAddressId, setBillingAddressId] = useState("");
  const [shippingAddressId, setShippingAddressId] = useState("");
  const [billingDraftAddress, setBillingDraftAddress] = useState<DraftAddress>(EMPTY_ADDRESS);
  const [shippingDraftAddress, setShippingDraftAddress] = useState<DraftAddress>(EMPTY_ADDRESS);
  const [isBillingAddressDialogOpen, setIsBillingAddressDialogOpen] = useState(false);
  const [isShippingAddressDialogOpen, setIsShippingAddressDialogOpen] = useState(false);

  // Lines
  const [lines, setLines] = useState<OrderLine[]>([]);
  const [isVariantDialogOpen, setIsVariantDialogOpen] = useState(false);

  // Shipping
  const [shippingMethods, setShippingMethods] = useState<ShippingMethodOption[]>([]);
  const [shippingMethodId, setShippingMethodId] = useState("");
  const [isShippingDialogOpen, setIsShippingDialogOpen] = useState(false);

  // Other
  const [internalNote, setInternalNote] = useState("");
  const [saveBillingAddress, setSaveBillingAddress] = useState(false);
  const [saveShippingAddress, setSaveShippingAddress] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Derived
  const linesCount = lines.length;
  const totalQty = useMemo(
    () => lines.reduce((acc, l) => acc + (Number.isFinite(l.quantity) ? l.quantity : 0), 0),
    [lines],
  );

  const subtotal = useMemo(() => {
    let sum = 0;
    let currency = "";
    for (const l of lines) {
      if (l.unitPrice && !l.isGift) {
        sum += l.unitPrice.amount * l.quantity;
        currency = l.unitPrice.currency;
      }
    }
    return currency ? { amount: sum, currency } : null;
  }, [lines]);

  // Load shipping methods when country changes
  const prevCountryRef = useRef("");
  const shippingCountry = normalizeCountryCode(
    shippingDraftAddress.countryCode || channelDefaultCountryCode || "US",
  );

  useEffect(() => {
    if (!channelId || !shippingCountry || shippingCountry.length < 2) {
      setShippingMethods([]);
      setShippingMethodId("");
      prevCountryRef.current = "";
      return;
    }

    const key = `${channelId}:${shippingCountry}`;
    if (key === prevCountryRef.current) return;
    prevCountryRef.current = key;

    let cancelled = false;

    void (async () => {
      const result = await getChannelShippingMethods(channelId, shippingCountry);
      if (cancelled) return;

      if (!result.ok) {
        setShippingMethods([]);
        setShippingMethodId("");
        return;
      }

      const perCountry =
        result.data.channel?.availableShippingMethodsPerCountry ?? [];

      const methodsRaw =
        perCountry.find(
          (x) => String(x.countryCode).toUpperCase() === shippingCountry,
        )?.shippingMethods ??
        perCountry[0]?.shippingMethods ??
        [];

      const mapped: ShippingMethodOption[] = (methodsRaw ?? [])
        .filter(Boolean)
        .map((m) => ({
          id: m.id,
          name: m.name,
          active: m.active,
          price: { amount: m.price.amount, currency: m.price.currency },
        }));

      setShippingMethods(mapped);
      setShippingMethodId((prev) =>
        mapped.some((m) => m.id === prev) ? prev : "",
      );
    })();

    return () => { cancelled = true; };
  }, [channelId, shippingCountry]);

  const canCreate = useMemo(() => {
    const hasCustomer = Boolean(selectedCustomer?.id);
    const hasLines = lines.length > 0 && lines.every((l) => l.variantId && l.quantity > 0);
    const hasShipping =
      Boolean(shippingDraftAddress.firstName.trim()) &&
      Boolean(shippingDraftAddress.streetAddress1.trim()) &&
      Boolean(shippingDraftAddress.city.trim()) &&
      Boolean(shippingDraftAddress.countryCode.trim());
    const hasBilling =
      Boolean(billingDraftAddress.firstName.trim()) &&
      Boolean(billingDraftAddress.streetAddress1.trim()) &&
      Boolean(billingDraftAddress.city.trim()) &&
      Boolean(billingDraftAddress.countryCode.trim());
    const hasShippingMethod = Boolean(shippingMethodId);
    return Boolean(channelId) && hasCustomer && hasLines && hasShipping && hasBilling && hasShippingMethod;
  }, [
    billingDraftAddress,
    channelId,
    lines,
    selectedCustomer?.id,
    shippingDraftAddress,
    shippingMethodId,
  ]);

  const selectedShippingMethod = useMemo(
    () => shippingMethods.find((m) => m.id === shippingMethodId) ?? null,
    [shippingMethodId, shippingMethods],
  );

  const handleConfirmChannel = () => {
    if (!pendingChannelId) return;
    // Reset all order state for the new channel.
    setSelectedCustomer(null);
    setBillingAddressId("");
    setShippingAddressId("");
    setLines([]);
    setShippingMethods([]);
    setShippingMethodId("");
    setInternalNote("");
    setSaveBillingAddress(false);
    setSaveShippingAddress(false);
    prevCountryRef.current = "";

    setChannelId(pendingChannelId);
    setIsChannelDialogOpen(false);
    // Keep addresses as Not set initially; country fallback is used for shipping methods.
    setBillingDraftAddress(EMPTY_ADDRESS);
    setShippingDraftAddress(EMPTY_ADDRESS);
  };

  const handleChangeChannel = () => {
    const confirmed = window.confirm(
      "Changing channel will clear current order data. Continue?",
    );
    if (!confirmed) return;

    setSelectedCustomer(null);
    setBillingAddressId("");
    setShippingAddressId("");
    setBillingDraftAddress(EMPTY_ADDRESS);
    setShippingDraftAddress(EMPTY_ADDRESS);
    setLines([]);
    setShippingMethods([]);
    setShippingMethodId("");
    setInternalNote("");
    setSaveBillingAddress(false);
    setSaveShippingAddress(false);
    prevCountryRef.current = "";

    setPendingChannelId(channelId);
    setChannelId("");
    setIsChannelDialogOpen(true);
  };

  const handlePickCustomer = useCallback((customer: CustomerNode) => {
    setSelectedCustomer(customer);

    const defaultBilling = customer.defaultBillingAddress ?? null;
    const defaultShipping = customer.defaultShippingAddress ?? null;

    if (defaultBilling) {
      setBillingAddressId(defaultBilling.id);
      const next = savedAddressToDraftAddress(defaultBilling);
      setBillingDraftAddress({
        ...next,
        countryCode: next.countryCode || channelDefaultCountryCode,
      });
    }
    if (defaultShipping) {
      setShippingAddressId(defaultShipping.id);
      const next = savedAddressToDraftAddress(defaultShipping);
      setShippingDraftAddress({
        ...next,
        countryCode: next.countryCode || channelDefaultCountryCode,
      });
    } else if (defaultBilling) {
      setShippingAddressId(defaultBilling.id);
      const next = savedAddressToDraftAddress(defaultBilling);
      setShippingDraftAddress({
        ...next,
        countryCode: next.countryCode || channelDefaultCountryCode,
      });
    }
  }, [channelDefaultCountryCode]);

  const handleRemoveLine = (variantId: string) => {
    setLines((prev) => prev.filter((l) => l.variantId !== variantId));
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      if (!selectedCustomer?.id) {
        toast({ title: "Customer is required", variant: "destructive" });
        return;
      }
      if (!lines.length) {
        toast({ title: "At least one item is required", variant: "destructive" });
        return;
      }
      if (lines.some((l) => !l.isGift && !l.unitPrice)) {
        toast({
          title: "Some items have no price in this channel",
          description: "Remove them or pick variants with a price.",
          variant: "destructive",
        });
        return;
      }
      if (!shippingMethodId) {
        toast({ title: "Shipping method is required", variant: "destructive" });
        return;
      }
      if (!billingDraftAddress.firstName.trim() || !billingDraftAddress.streetAddress1.trim() || !billingDraftAddress.city.trim() || !billingDraftAddress.countryCode.trim()) {
        toast({ title: "Billing address is required", variant: "destructive" });
        return;
      }
      if (!shippingDraftAddress.firstName.trim() || !shippingDraftAddress.streetAddress1.trim() || !shippingDraftAddress.city.trim() || !shippingDraftAddress.countryCode.trim()) {
        toast({ title: "Shipping address is required", variant: "destructive" });
        return;
      }
      if (!channelId) {
        toast({ title: "Channel is required", variant: "destructive" });
        return;
      }

      const input: DraftOrderCreateInput = {
        channelId,
        user: selectedCustomer.id,
        billingAddress: draftAddressToAddressInput(billingDraftAddress),
        shippingAddress: draftAddressToAddressInput(shippingDraftAddress),
        lines: lines.map(
          (l): OrderLineCreateInput => ({
            quantity: l.quantity,
            variantId: l.variantId,
            ...(l.isGift === true ? { price: 0, forceNewLine: true } : {}),
          }),
        ),
        shippingMethod: shippingMethodId,
        ...(saveBillingAddress ? { saveBillingAddress } : {}),
        ...(saveShippingAddress ? { saveShippingAddress } : {}),
      };

      const result = await createDraftOrder(input);

      if (!result.ok) {
        toast({
          title: "Failed to create draft order",
          description: result.errors.map((e) => e.message).join(", "),
          variant: "destructive",
        });
        return;
      }

      const payload = result.data.draftOrderCreate;
      const errors = payload?.errors ?? [];

      if (errors.length) {
        toast({
          title: "Draft order create failed",
          description: errors.map((e) => e.message).filter(Boolean).join(", ") || "Unknown error",
          variant: "destructive",
        });
        return;
      }

      const orderId = payload?.order?.id;
      if (!orderId) {
        toast({ title: "Draft order create failed", description: "No order returned", variant: "destructive" });
        return;
      }

      // Convert draft -> order
      const complete = await completeDraftOrder(orderId);

      if (!complete.ok) {
        // Best-effort rollback (avoid leaving drafts when save failed).
        await deleteDraftOrder(orderId);
        toast({
          title: "Draft created, but completion failed",
          description: complete.errors.map((e) => e.message).join(", "),
          variant: "destructive",
        });
        return;
      }

      const completeErrors = complete.data.draftOrderComplete?.errors ?? [];
      if (completeErrors.length) {
        await deleteDraftOrder(orderId);
        toast({
          title: "Draft created, but completion failed",
          description:
            completeErrors.map((e) => e.message).filter(Boolean).join(", ") ||
            "Unknown error",
          variant: "destructive",
        });
        return;
      }

      const finalId = complete.data.draftOrderComplete?.order?.id ?? orderId;

      const note = internalNote.trim();
      if (note) {
        const noteResult = await addInternalOrderNote(finalId, note);
        if (!noteResult.ok) {
          toast({
            title: "Order created, but note failed",
            description: noteResult.errors.map((e) => e.message).join(", "),
            variant: "destructive",
          });
        } else {
          const noteErrors = noteResult.data.orderNoteAdd?.errors ?? [];
          if (noteErrors.length) {
            toast({
              title: "Order created, but note failed",
              description:
                noteErrors.map((e) => e.message).filter(Boolean).join(", ") ||
                "Unknown error",
              variant: "destructive",
            });
          }
        }
      }

      toast({
        title: "Order created",
        description: complete.data.draftOrderComplete?.order?.number
          ? `Order #${complete.data.draftOrderComplete.order.number}`
          : "Order created.",
      });
      void router.push(`/orders/${finalId}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasChannel = Boolean(channelId);

  return (
    <div className="min-h-screen">
      {/* Channel selection dialog */}
      <Dialog open={isChannelDialogOpen} onOpenChange={() => {}}>
        <DialogContent className="max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Select channel</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">
              Choose a channel to start creating the order. All data (products, pricing,
              shipping) depends on the selected channel.
            </p>
            <Select value={pendingChannelId} onValueChange={setPendingChannelId}>
              <SelectTrigger>
                <SelectValue placeholder="Select channel" />
              </SelectTrigger>
              <SelectContent>
                {activeChannels.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name} ({c.currencyCode})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => router.push("/orders")}>
              Cancel
            </Button>
            <Button
              className="bg-stone-900 hover:bg-stone-800"
              disabled={!pendingChannelId}
              onClick={handleConfirmChannel}
            >
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Sticky header */}
      <div className="fixed left-0 right-0 top-16 z-40 border-b bg-background">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="sm" className="gap-2">
              <Link href="/orders">
                <ArrowLeft className="h-4 w-4" />
                All orders
              </Link>
            </Button>
            <h1 className="text-2xl font-semibold">New order</h1>
            <ColorBadge label="Draft" />
          </div>
          <div className="flex items-center gap-2">
            <Button type="button" size="sm" variant="outline" onClick={() => router.push("/orders")}>
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              className="bg-stone-900 hover:bg-stone-800"
              onClick={() => void handleSubmit()}
              disabled={!canCreate || isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Create order"}
            </Button>
          </div>
        </div>
      </div>

      {hasChannel && (
        <div className="mx-auto mt-20 px-6 pb-6">
          <div className="grid w-full gap-4">
            <div className="flex w-full gap-4">
              <div className="flex grow basis-2/3 flex-col gap-4">
                {/* Items */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Order lines</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-sm text-muted-foreground">
                        Add one or more variants as order lines.
                      </p>
                      <Button
                        type="button"
                        className="bg-stone-900 hover:bg-stone-800"
                        onClick={() => setIsVariantDialogOpen(true)}
                      >
                        Add products
                      </Button>
                    </div>

                    {lines.length > 0 ? (
                      <div className="space-y-2">
                        {lines.map((l) => (
                          <div
                            key={l.variantId}
                            className="flex items-center gap-3 rounded-md border px-3 py-2"
                          >
                            {l.thumbnail?.url ? (
                              <div className="relative h-12 w-12 overflow-hidden rounded border">
                                <Image
                                  src={l.thumbnail.url}
                                  alt={l.thumbnail.alt || l.productName || l.variantName}
                                  fill
                                  className="object-cover"
                                  unoptimized
                                />
                              </div>
                            ) : (
                              <div className="h-12 w-12 rounded border bg-muted" />
                            )}
                            <div className="flex min-w-0 flex-1 items-center justify-between gap-4 text-sm">
                              <div className="min-w-0">
                                <div className="truncate font-medium">
                                  {l.productName || l.variantName}
                                </div>
                                {l.productName ? (
                                  <div className="text-xs text-muted-foreground">
                                    {l.variantName}
                                  </div>
                                ) : null}
                                <div className="mt-1 flex items-center gap-2">
                                  <span className="text-xs text-muted-foreground">Qty</span>
                                  <Input
                                    className="w-20"
                                    type="number"
                                    min={1}
                                    value={l.quantity}
                                    onChange={(e) => {
                                      const next = parseInt(e.target.value, 10);
                                      setLines((prev) =>
                                        prev.map((x) =>
                                          x.variantId === l.variantId
                                            ? {
                                                ...x,
                                                quantity:
                                                  Number.isFinite(next) && next > 0 ? next : 1,
                                              }
                                            : x,
                                        ),
                                      );
                                    }}
                                  />
                                  <label className="ml-3 flex items-center gap-1 text-xs text-muted-foreground">
                                    <input
                                      type="checkbox"
                                      checked={Boolean(l.isGift)}
                                      onChange={(e) => {
                                        setLines((prev) =>
                                          prev.map((x) =>
                                            x.variantId === l.variantId
                                              ? { ...x, isGift: e.target.checked }
                                              : x,
                                          ),
                                        );
                                      }}
                                    />
                                    Gift
                                  </label>
                                </div>
                              </div>
                              <div className="flex flex-col items-end gap-1">
                                {l.unitPrice && !l.isGift ? (
                                  <>
                                    <span className="text-xs text-muted-foreground">
                                      {formatPrice(l.unitPrice.amount, l.unitPrice.currency)} / unit
                                    </span>
                                    <span className="text-sm font-medium">
                                      {formatPrice(
                                        l.unitPrice.amount * l.quantity,
                                        l.unitPrice.currency,
                                      )}
                                    </span>
                                  </>
                                ) : l.isGift ? (
                                  <span className="text-xs font-medium text-green-600">Gift</span>
                                ) : (
                                  <span className="text-sm text-muted-foreground">—</span>
                                )}
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleRemoveLine(l.variantId)}
                                >
                                  Remove
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No line items</p>
                    )}
                  </CardContent>
                </Card>

                {/* Shipping */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Shipping</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Label>Shipping method</Label>
                    <div className="flex items-center justify-between gap-3 rounded-md border px-3 py-2">
                      <div className="min-w-0">
                        <div className="truncate text-sm">
                          {selectedShippingMethod
                            ? `${selectedShippingMethod.name} — ${formatPrice(
                                selectedShippingMethod.price.amount,
                                selectedShippingMethod.price.currency,
                              )}`
                            : "—"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Based on channel + shipping country.
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsShippingDialogOpen(true)}
                      >
                        Choose
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Notes */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Notes</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Label>Order Note</Label>
                    <Textarea
                      value={internalNote}
                      onChange={(e) => setInternalNote(e.target.value)}
                      placeholder="Note for customer"
                    />
                  </CardContent>
                </Card>

                {/* Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Lines</span>
                      <span className="font-medium">
                        {linesCount} ({totalQty} items)
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal (items)</span>
                      <span className="font-medium">
                        {subtotal ? formatPrice(subtotal.amount, subtotal.currency) : "—"}
                      </span>
                    </div>
                    <div className="flex items-start justify-between gap-4 text-sm">
                      <span className="text-muted-foreground">Shipping</span>
                      <span className="text-right font-medium">
                        {selectedShippingMethod
                          ? `${selectedShippingMethod.name} — ${formatPrice(
                              selectedShippingMethod.price.amount,
                              selectedShippingMethod.price.currency,
                            )}`
                          : "—"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm font-medium">
                      <span>Total (estimated)</span>
                      <span>
                        {subtotal
                          ? formatPrice(
                              subtotal.amount + (selectedShippingMethod?.price.amount ?? 0),
                              subtotal.currency,
                            )
                          : "—"}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="flex grow basis-1/3 flex-col gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Customer details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-sm text-muted-foreground">Customer</p>
                        <p className="mt-1 truncate font-medium">
                          {selectedCustomer ? customerDisplay(selectedCustomer) : "Not set"}
                        </p>
                      </div>
                      <Button
                        type="button"
                        className={
                          !selectedCustomer ? "bg-stone-900 text-white hover:bg-stone-800" : ""
                        }
                        variant={selectedCustomer ? "outline" : "default"}
                        onClick={() => setIsCustomerDialogOpen(true)}
                      >
                        {selectedCustomer ? "Change customer" : "Select customer"}
                      </Button>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">Shipping address</p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={!selectedCustomer}
                          onClick={() => setIsShippingAddressDialogOpen(true)}
                        >
                          Edit
                        </Button>
                      </div>
                      <div className="rounded-md border px-3 py-2 text-sm">
                        {draftAddressSummary(shippingDraftAddress) || "Not set"}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">Billing address</p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={!selectedCustomer}
                          onClick={() => setIsBillingAddressDialogOpen(true)}
                        >
                          Edit
                        </Button>
                      </div>
                      <div className="rounded-md border px-3 py-2 text-sm">
                        {draftAddressSummary(billingDraftAddress) || "Not set"}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Sales channel</CardTitle>
                  </CardHeader>
                  <CardContent className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="truncate font-medium">
                        {selectedChannel
                          ? `${selectedChannel.name} (${selectedChannel.currencyCode})`
                          : "—"}
                      </p>
                    </div>
                    <Button type="button" variant="outline" onClick={handleChangeChannel}>
                      Change
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* Dialogs */}
          <CustomerPickerDialog
            open={isCustomerDialogOpen}
            onOpenChange={setIsCustomerDialogOpen}
            selectedCustomerId={selectedCustomer?.id ?? null}
            onPick={handlePickCustomer}
          />

          <AddressManageDialog
            open={isBillingAddressDialogOpen}
            onOpenChange={setIsBillingAddressDialogOpen}
            title="Change billing address"
            addresses={selectedCustomer?.addresses ?? []}
            countryOptions={selectedChannel?.countries ?? []}
            selectedAddressId={billingAddressId}
            onSave={({ mode, addressId, draftAddress }) => {
              if (mode === "saved" && addressId) {
                setBillingAddressId(addressId);
                const addr = selectedCustomer?.addresses?.find((a) => a.id === addressId);
                if (addr) setBillingDraftAddress(savedAddressToDraftAddress(addr));
              } else {
                setBillingAddressId("");
                setBillingDraftAddress(draftAddress);
              }
            }}
          />

          <AddressManageDialog
            open={isShippingAddressDialogOpen}
            onOpenChange={setIsShippingAddressDialogOpen}
            title="Change shipping address"
            addresses={selectedCustomer?.addresses ?? []}
            countryOptions={selectedChannel?.countries ?? []}
            selectedAddressId={shippingAddressId}
            onSave={({ mode, addressId, draftAddress }) => {
              if (mode === "saved" && addressId) {
                setShippingAddressId(addressId);
                const addr = selectedCustomer?.addresses?.find((a) => a.id === addressId);
                if (addr) setShippingDraftAddress(savedAddressToDraftAddress(addr));
              } else {
                setShippingAddressId("");
                setShippingDraftAddress(draftAddress);
              }
            }}
          />

          <VariantSelectionDialog
            open={isVariantDialogOpen}
            onOpenChange={setIsVariantDialogOpen}
            channelName={selectedChannel?.name ?? undefined}
            channelId={channelId}
            initialLines={lines}
            onSave={(nextLines) => setLines(nextLines)}
          />

          <ShippingMethodPickerDialog
            open={isShippingDialogOpen}
            onOpenChange={setIsShippingDialogOpen}
            methods={shippingMethods}
            selectedId={shippingMethodId}
            onPick={setShippingMethodId}
          />
        </div>
      )}
    </div>
  );
}
