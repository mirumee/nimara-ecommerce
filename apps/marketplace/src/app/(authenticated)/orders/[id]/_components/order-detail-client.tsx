"use client";

import {
  ArrowLeft,
  ChevronDown,
  CreditCard,
  MoreHorizontal,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useRef, useState } from "react";

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
  AddressInput,
  CancelOrder,
  CustomerByEmail,
  DiscountValueTypeEnum,
  FulfillOrder,
  OrderDetail,
} from "@/graphql/generated/client";
import { formatPrice } from "@/lib/utils";

import {
  AddressManageDialog,
  type DraftAddress,
} from "../../_components/address-manage-dialog";
import { CustomerPickerDialog } from "../../_components/customer-picker-dialog";
import { OrderDiscountDialog } from "../../_components/order-discount-dialog";
import {
  type ShippingMethodOption,
  ShippingMethodPickerDialog,
} from "../../_components/shipping-method-picker-dialog";
import {
  type VariantLineDraft,
  VariantSelectionDialog,
} from "../../_components/variant-selection-dialog";
import {
  addOrderDiscount,
  addOrderLines,
  deleteDraftOrder,
  deleteOrderDiscount,
  deleteOrderLine,
  finalizeDraftOrder,
  getChannelShippingMethods,
  updateDraftOrder,
  updateOrder,
  updateOrderLine,
} from "../../actions";
import {
  cancelFulfillment,
  cancelOrder,
  fulfillOrder,
  markOrderAsPaid,
} from "../actions";

type LineInputMap = Record<
  string,
  {
    quantity: number;
    warehouse_id: string;
  }
>;

function isNonNull<T>(value: T): value is NonNullable<T> {
  return value !== null && value !== undefined;
}

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

function formatAddress(
  address: Address | null | undefined,
  t: (key: string) => string,
): string {
  if (!address) {
    return t("common.no-address-provided");
  }

  const parts = [
    [address.firstName, address.lastName].filter(Boolean).join(" "),
    address.streetAddress1,
    address.streetAddress2,
    [address.postalCode, address.city].filter(Boolean).join(" "),
    address.country?.country,
  ].filter(Boolean);

  return parts.join(", ");
}

type CustomerNode = NonNullable<
  NonNullable<
    NonNullable<CustomerByEmail["customers"]>["edges"][number]
  >["node"]
>;

function formatOrderErrors(
  errors: Array<{
    code?: string | null;
    field?: string | null;
    message?: string | null;
  }>,
  fallback: string,
): string {
  const text = errors
    .map((e) => {
      const prefix = [
        e.field ? `field=${e.field}` : null,
        e.code ? `code=${e.code}` : null,
      ]
        .filter(Boolean)
        .join(" ");
      const msg = e.message ?? null;

      return [prefix, msg].filter(Boolean).join(" ");
    })
    .filter(Boolean)
    .join(", ");

  return text || fallback;
}

function normalizeCountryCode(code: string): string {
  const upper = code.trim().toUpperCase();
  const map: Record<string, string> = { USA: "US", UK: "GB" };

  if (map[upper]) {
    return map[upper];
  }

  return upper.length > 2 ? upper.slice(0, 2) : upper;
}

function orderAddressToDraftAddress(
  a: Address | null | undefined,
  fallbackCountryCode: string,
): DraftAddress {
  return {
    firstName: a?.firstName ?? "",
    lastName: a?.lastName ?? "",
    companyName: undefined,
    streetAddress1: a?.streetAddress1 ?? "",
    streetAddress2: a?.streetAddress2 ?? undefined,
    city: a?.city ?? "",
    cityArea: undefined,
    postalCode: a?.postalCode ?? "",
    countryArea: undefined,
    phone: a?.phone ?? undefined,
    countryCode: normalizeCountryCode(a?.country?.code ?? fallbackCountryCode),
  };
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

function savedAddressToDraftAddress(address: {
  city?: string | null;
  cityArea?: string | null;
  companyName?: string | null;
  country?: { code: string } | null;
  countryArea?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  postalCode?: string | null;
  streetAddress1?: string | null;
  streetAddress2?: string | null;
}): DraftAddress {
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

interface OrderDetailClientProps {
  order: NonNullable<OrderDetail["order"]>;
  warehouses: Array<{ id: string; name: string }>;
}

export function OrderDetailClient({
  order,
  warehouses,
}: OrderDetailClientProps) {
  const t = useTranslations();
  const router = useRouter();
  const { toast } = useToast();

  const isDraft = order.status === "DRAFT";

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

  const [isFinalizing, setIsFinalizing] = useState(false);

  const [isCustomerDialogOpen, setIsCustomerDialogOpen] = useState(false);
  const [isShippingAddressDialogOpen, setIsShippingAddressDialogOpen] =
    useState(false);
  const [isBillingAddressDialogOpen, setIsBillingAddressDialogOpen] =
    useState(false);
  const [draftCustomer, setDraftCustomer] = useState<CustomerNode | null>(null);

  const [isVariantDialogOpen, setIsVariantDialogOpen] = useState(false);

  const [isDiscountDialogOpen, setIsDiscountDialogOpen] = useState(false);
  const [isDeletingDraft, setIsDeletingDraft] = useState(false);
  const [showMarkAsPaidDialog, setShowMarkAsPaidDialog] = useState(false);
  const [isMarkingAsPaid, setIsMarkingAsPaid] = useState(false);
  const [transactionReference, setTransactionReference] = useState("");

  const [shippingMethods, setShippingMethods] = useState<
    ShippingMethodOption[]
  >([]);
  const [isShippingDialogOpen, setIsShippingDialogOpen] = useState(false);
  const [isLoadingShippingMethods, setIsLoadingShippingMethods] =
    useState(false);

  const [lineQtyById, setLineQtyById] = useState<Record<string, number>>({});
  const qtySaveTimersRef = useRef<
    Record<string, ReturnType<typeof setTimeout> | undefined>
  >({});

  const channelDefaultCountryCode = useMemo(() => {
    const raw =
      order.channel?.defaultCountry?.code ??
      order.channel?.countries?.[0]?.code ??
      "US";

    return normalizeCountryCode(raw);
  }, [order.channel?.countries, order.channel?.defaultCountry?.code]);

  const shippingCountryCode = useMemo(() => {
    const raw =
      order.shippingAddress?.country?.code ??
      order.billingAddress?.country?.code ??
      channelDefaultCountryCode ??
      "US";

    return normalizeCountryCode(raw);
  }, [
    channelDefaultCountryCode,
    order.billingAddress?.country?.code,
    order.shippingAddress?.country?.code,
  ]);

  const draftVariantLines = useMemo((): VariantLineDraft[] => {
    const lines = (order.lines ?? []).filter(isNonNull);

    return lines
      .map((l): VariantLineDraft | null => {
        const variantId = l.variant?.id ?? "";

        if (!variantId) {
          return null;
        }
        const qty = lineQtyById[l.id] ?? l.quantity ?? 1;
        const gross = l.unitPrice?.gross ?? null;

        return {
          variantId,
          quantity: Math.max(1, qty),
          sku: l.productSku ?? "",
          variantName: l.variantName ?? "",
          productName: l.productName ?? undefined,
          thumbnail: l.thumbnail ?? null,
          unitPrice: gross
            ? { amount: gross.amount, currency: gross.currency }
            : null,
        };
      })
      .filter(isNonNull);
  }, [lineQtyById, order.lines]);

  useEffect(() => {
    if (!isDraft) {
      return;
    }
    const next: Record<string, number> = {};

    for (const l of order.lines ?? []) {
      if (l) {
        next[l.id] = Math.max(1, l.quantity ?? 1);
      }
    }
    setLineQtyById(next);
  }, [isDraft, order.lines]);

  useEffect(() => {
    if (!isDraft) {
      return;
    }
    if (!isShippingDialogOpen) {
      return;
    }

    let cancelled = false;

    setIsLoadingShippingMethods(true);
    void (async () => {
      const result = await getChannelShippingMethods(
        order.channel.id,
        shippingCountryCode,
      );

      if (cancelled) {
        return;
      }

      if (!result.ok) {
        setShippingMethods([]);
        setIsLoadingShippingMethods(false);

        return;
      }

      const perCountry =
        result.data.channel?.availableShippingMethodsPerCountry ?? [];

      const methodsRaw =
        perCountry.find(
          (x) => String(x.countryCode).toUpperCase() === shippingCountryCode,
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
      setIsLoadingShippingMethods(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [isDraft, isShippingDialogOpen, order.channel.id, shippingCountryCode]);

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
          .map(
            (e: { message?: string | null }) =>
              e.message || t("common.toast-unknown-error"),
          )
          .join(", ");

        toast({
          title: t("marketplace.orders.detail.toast-fulfill-failed"),
          description: message,
          variant: "destructive",
        });

        return;
      }

      const fulfillData = result.data as unknown as FulfillOrder;
      const errors = fulfillData?.orderFulfill?.errors ?? [];

      if (errors.length > 0) {
        const message = errors
          .map((e: { message: string | null }) => e.message)
          .filter(Boolean)
          .join(", ");

        toast({
          title: t("marketplace.orders.detail.toast-fulfill-failed"),
          description: message || t("common.toast-unknown-error"),
          variant: "destructive",
        });

        return;
      }
      toast({
        title: t("marketplace.orders.detail.toast-fulfilled"),
        description: t("marketplace.orders.detail.toast-fulfilled-desc"),
      });
      setFulfillmentData({});
      setIsFulfilling(false);
      setTrackingNumber("");
      setNotifyCustomer(false);
      router.refresh();
    } catch (error) {
      toast({
        title: t("marketplace.orders.detail.toast-fulfill-failed"),
        description: t("common.toast-something-wrong"),
        variant: "destructive",
      });
    } finally {
      setIsPendingFulfillment(false);
    }
  };

  const handleCancelFulfillmentById = async (
    fulfillmentId: string,
    warehouseId: string,
  ) => {
    setCancelingFulfillmentId(fulfillmentId);

    try {
      const result = await cancelFulfillment(
        { id: fulfillmentId, input: { warehouseId } },
        order.id,
      );

      if (!result.ok) {
        const message = result.errors
          .map(
            (e: { message?: string | null }) =>
              e.message || t("common.toast-unknown-error"),
          )
          .join(", ");

        toast({
          title: t("marketplace.orders.detail.toast-cancel-fulfillment-failed"),
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
          title: t("marketplace.orders.detail.toast-cancel-fulfillment-failed"),
          description: message || t("common.toast-unknown-error"),
          variant: "destructive",
        });

        return;
      }

      toast({
        title: t("marketplace.orders.detail.toast-fulfillment-canceled"),
        description: t(
          "marketplace.orders.detail.toast-fulfillment-canceled-desc",
        ),
      });

      setCancelFulfillmentTarget(null);
      router.refresh();
    } catch (error) {
      toast({
        title: t("marketplace.orders.detail.toast-cancel-fulfillment-failed"),
        description: t("common.toast-something-wrong"),
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
          title: t("marketplace.orders.detail.toast-order-cancel-failed"),
          description: t("common.toast-no-response"),
          variant: "destructive",
        });

        return;
      }

      if (!result.ok) {
        const message = (result.errors ?? [])
          .map(
            (e: { message?: string | null }) =>
              e?.message || t("common.toast-unknown-error"),
          )
          .join(", ");

        toast({
          title: t("marketplace.orders.detail.toast-order-cancel-failed"),
          description: message || t("common.toast-something-wrong"),
          variant: "destructive",
        });

        return;
      }

      const cancelPayload = (result.data as unknown as CancelOrder)
        ?.orderCancel;

      if (cancelPayload?.errors?.length) {
        const messages = cancelPayload.errors
          .map((e: { message: string | null }) => e.message)
          .filter(Boolean)
          .join(", ");

        toast({
          title: t("marketplace.orders.detail.toast-order-cancel-failed"),
          description: messages || t("common.toast-unknown-error"),
          variant: "destructive",
        });
      } else {
        setShowCancelOrderDialog(false);
        toast({
          title: t("marketplace.orders.detail.toast-order-canceled"),
          description: t("marketplace.orders.detail.toast-order-canceled-desc"),
        });
        router.push("/orders");
      }
    } catch (error) {
      console.error("Order cancel error:", error);
      toast({
        title: t("marketplace.orders.detail.toast-order-cancel-failed"),
        description:
          error instanceof Error
            ? error.message
            : t("common.toast-something-wrong"),
        variant: "destructive",
      });
    } finally {
      setIsCancelling(false);
    }
  };

  const isSameAddress = addressesAreEqual(
    order.billingAddress,
    order.shippingAddress,
  );

  const unfulfilledLines =
    order.lines?.filter(
      (line) => line.quantityToFulfill && line.quantityToFulfill > 0,
    ) ?? [];

  const fulfilledLines =
    order.lines?.filter((line) => line.quantityFulfilled > 0) ?? [];

  const customerPhone =
    order.shippingAddress?.phone ?? order.billingAddress?.phone ?? null;

  const itemCount = order.lines?.length ?? 0;
  const itemLabel =
    itemCount === 1
      ? t("marketplace.orders.detail.item")
      : t("marketplace.orders.detail.items");

  const handlePrintPackingSlips = () => {
    console.log("Print packing slips");
  };

  const handleMessageCustomer = () => {
    console.log("Message customer");
  };

  const handleRefund = () => {
    console.log("Refund");
  };

  const handleFinalizeDraft = async () => {
    if (!isDraft || isFinalizing) {
      return;
    }

    setIsFinalizing(true);
    try {
      const result = await finalizeDraftOrder(order.id);

      if (!result.ok) {
        toast({
          title: t("marketplace.orders.detail.toast-finalize-failed"),
          description: result.errors.map((e) => e.message).join(", "),
          variant: "destructive",
        });

        return;
      }

      const errors = result.data.draftOrderComplete?.errors ?? [];

      if (errors.length) {
        toast({
          title: t("marketplace.orders.detail.toast-finalize-failed"),
          description:
            errors
              .map((e) => e.message)
              .filter(Boolean)
              .join(", ") || t("common.toast-unknown-error"),
          variant: "destructive",
        });

        return;
      }

      toast({
        title: t("marketplace.orders.detail.toast-order-finalized"),
      });
      router.refresh();
    } finally {
      setIsFinalizing(false);
    }
  };

  const handleDeleteDraft = async () => {
    if (!isDraft || isDeletingDraft) {
      return;
    }

    setIsDeletingDraft(true);
    try {
      const result = await deleteDraftOrder(order.id);

      if (!result.ok) {
        toast({
          title: t("marketplace.orders.detail.toast-draft-cancel-failed"),
          description: result.errors.map((e) => e.message).join(", "),
          variant: "destructive",
        });

        return;
      }

      const errors = result.data.draftOrderDelete?.errors ?? [];

      if (errors.length) {
        toast({
          title: t("marketplace.orders.detail.toast-draft-cancel-failed"),
          description: formatOrderErrors(
            errors,
            t("common.toast-unknown-error"),
          ),
          variant: "destructive",
        });

        return;
      }

      toast({
        title: t("marketplace.orders.detail.toast-draft-deleted"),
        description: t("marketplace.orders.detail.toast-draft-deleted-desc"),
      });
      router.push("/orders");
    } finally {
      setIsDeletingDraft(false);
    }
  };

  const handleMarkAsPaid = async () => {
    const reference = transactionReference.trim();

    if (!reference) {
      toast({
        title: t("marketplace.orders.detail.transaction-reference-required"),
        description: t("marketplace.orders.detail.transaction-reference-desc"),
        variant: "destructive",
      });

      return;
    }

    setIsMarkingAsPaid(true);
    try {
      const result = await markOrderAsPaid({
        id: order.id,
        transactionReference: reference,
      });

      if (!result.ok) {
        toast({
          title: t("marketplace.orders.detail.toast-mark-as-paid-failed"),
          description: result.errors.map((e) => e.message).join(", "),
          variant: "destructive",
        });

        return;
      }

      const errors = result.data.orderMarkAsPaid?.errors ?? [];

      if (errors.length) {
        toast({
          title: t("marketplace.orders.detail.toast-mark-as-paid-failed"),
          description: formatOrderErrors(
            errors,
            t("common.toast-unknown-error"),
          ),
          variant: "destructive",
        });

        return;
      }

      setShowMarkAsPaidDialog(false);
      setTransactionReference("");
      toast({
        title: t("marketplace.orders.detail.toast-mark-as-paid"),
      });
      router.refresh();
    } finally {
      setIsMarkingAsPaid(false);
    }
  };

  const hasRegisteredTransactions = (order.transactions ?? []).length > 0;
  const totalCapturedAmount = order.totalCharged.amount;
  const totalAuthorizedAmount = order.totalAuthorized.amount;
  const isFullyCharged =
    order.paymentStatus === "FULLY_CHARGED" || order.chargeStatus === "FULL";
  const hasPaymentSummaryData =
    hasRegisteredTransactions ||
    totalCapturedAmount > 0 ||
    totalAuthorizedAmount > 0 ||
    isFullyCharged;
  const outstandingAuthorizedAmount = Math.max(
    totalAuthorizedAmount - totalCapturedAmount,
    0,
  );
  const outstandingBalanceAmount = Math.max(
    order.total.gross.amount - totalCapturedAmount,
    0,
  );

  const handlePickCustomer = async (customer: CustomerNode) => {
    if (!isDraft) {
      return;
    }

    const defaultBilling = customer.defaultBillingAddress ?? null;
    const defaultShipping = customer.defaultShippingAddress ?? null;
    const billingDraft = defaultBilling
      ? savedAddressToDraftAddress(defaultBilling)
      : null;
    const shippingDraft = defaultShipping
      ? savedAddressToDraftAddress(defaultShipping)
      : defaultBilling
        ? savedAddressToDraftAddress(defaultBilling)
        : null;

    const result = await updateDraftOrder(order.id, {
      user: customer.id,
      ...(billingDraft
        ? { billingAddress: draftAddressToAddressInput(billingDraft) }
        : {}),
      ...(shippingDraft
        ? { shippingAddress: draftAddressToAddressInput(shippingDraft) }
        : {}),
    });

    if (!result.ok) {
      toast({
        title: t("marketplace.orders.detail.toast-update-customer-failed"),
        description: result.errors.map((e) => e.message).join(", "),
        variant: "destructive",
      });

      return;
    }
    const errors = result.data.draftOrderUpdate?.errors ?? [];

    if (errors.length) {
      toast({
        title: t("marketplace.orders.detail.toast-update-customer-failed"),
        description: formatOrderErrors(errors, t("common.toast-unknown-error")),
        variant: "destructive",
      });

      return;
    }

    setDraftCustomer(customer);
    router.refresh();
  };

  const handleSaveShippingAddress = async (next: DraftAddress) => {
    const input = draftAddressToAddressInput(next);

    if (isDraft) {
      const result = await updateDraftOrder(order.id, {
        shippingAddress: input,
      });

      if (!result.ok) {
        toast({
          title: t("marketplace.orders.detail.toast-update-shipping-failed"),
          description: result.errors.map((e) => e.message).join(", "),
          variant: "destructive",
        });

        return;
      }

      const errors = result.data.draftOrderUpdate?.errors ?? [];

      if (errors.length) {
        toast({
          title: t("marketplace.orders.detail.toast-update-shipping-failed"),
          description: formatOrderErrors(
            errors,
            t("common.toast-unknown-error"),
          ),
          variant: "destructive",
        });

        return;
      }

      router.refresh();

      return;
    }

    const result = await updateOrder(order.id, { shippingAddress: input });

    if (!result.ok) {
      toast({
        title: t("marketplace.orders.detail.toast-update-shipping-failed"),
        description: result.errors.map((e) => e.message).join(", "),
        variant: "destructive",
      });

      return;
    }

    const errors = result.data.orderUpdate?.errors ?? [];

    if (errors.length) {
      toast({
        title: t("marketplace.orders.detail.toast-update-shipping-failed"),
        description: formatOrderErrors(errors, t("common.toast-unknown-error")),
        variant: "destructive",
      });

      return;
    }

    router.refresh();
  };

  const handleSaveBillingAddress = async (next: DraftAddress) => {
    const input = draftAddressToAddressInput(next);

    if (isDraft) {
      const result = await updateDraftOrder(order.id, {
        billingAddress: input,
      });

      if (!result.ok) {
        toast({
          title: t("marketplace.orders.detail.toast-update-billing-failed"),
          description: result.errors.map((e) => e.message).join(", "),
          variant: "destructive",
        });

        return;
      }

      const errors = result.data.draftOrderUpdate?.errors ?? [];

      if (errors.length) {
        toast({
          title: t("marketplace.orders.detail.toast-update-billing-failed"),
          description: formatOrderErrors(
            errors,
            t("common.toast-unknown-error"),
          ),
          variant: "destructive",
        });

        return;
      }

      router.refresh();

      return;
    }

    const result = await updateOrder(order.id, { billingAddress: input });

    if (!result.ok) {
      toast({
        title: t("marketplace.orders.detail.toast-update-billing-failed"),
        description: result.errors.map((e) => e.message).join(", "),
        variant: "destructive",
      });

      return;
    }

    const errors = result.data.orderUpdate?.errors ?? [];

    if (errors.length) {
      toast({
        title: t("marketplace.orders.detail.toast-update-billing-failed"),
        description: formatOrderErrors(errors, t("common.toast-unknown-error")),
        variant: "destructive",
      });

      return;
    }

    router.refresh();
  };

  const handlePickShippingMethod = async (shippingMethodId: string) => {
    if (!isDraft) {
      return;
    }
    const result = await updateDraftOrder(order.id, {
      shippingMethod: shippingMethodId,
    });

    if (!result.ok) {
      toast({
        title: t(
          "marketplace.orders.detail.toast-update-shipping-method-failed",
        ),
        description: result.errors.map((e) => e.message).join(", "),
        variant: "destructive",
      });

      return;
    }
    const errors = result.data.draftOrderUpdate?.errors ?? [];

    if (errors.length) {
      toast({
        title: t(
          "marketplace.orders.detail.toast-update-shipping-method-failed",
        ),
        description:
          errors
            .map((e) => e.message)
            .filter(Boolean)
            .join(", ") || t("common.toast-unknown-error"),
        variant: "destructive",
      });

      return;
    }
    router.refresh();
  };

  const handleAddDiscount = async (input: {
    reason?: string;
    value: number;
    valueType: DiscountValueTypeEnum;
  }) => {
    if (!isDraft) {
      return;
    }

    const result = await addOrderDiscount(order.id, input);

    if (!result.ok) {
      toast({
        title: t("marketplace.orders.detail.toast-add-discount-failed"),
        description: result.errors.map((e) => e.message).join(", "),
        variant: "destructive",
      });

      return;
    }
    const errors = result.data.orderDiscountAdd?.errors ?? [];

    if (errors.length) {
      toast({
        title: t("marketplace.orders.detail.toast-add-discount-failed"),
        description:
          errors
            .map((e) => e.message)
            .filter(Boolean)
            .join(", ") || t("common.toast-unknown-error"),
        variant: "destructive",
      });

      return;
    }

    setIsDiscountDialogOpen(false);
    router.refresh();
  };

  const handleRemoveDiscount = async (discountId: string) => {
    if (!isDraft) {
      return;
    }

    const result = await deleteOrderDiscount(discountId);

    if (!result.ok) {
      toast({
        title: t("marketplace.orders.detail.toast-remove-discount-failed"),
        description: result.errors.map((e) => e.message).join(", "),
        variant: "destructive",
      });

      return;
    }
    const errors = result.data.orderDiscountDelete?.errors ?? [];

    if (errors.length) {
      toast({
        title: t("marketplace.orders.detail.toast-remove-discount-failed"),
        description:
          errors
            .map((e) => e.message)
            .filter(Boolean)
            .join(", ") || t("common.toast-unknown-error"),
        variant: "destructive",
      });

      return;
    }

    router.refresh();
  };

  const handleDraftLineQtyChange = (lineId: string, qty: number) => {
    if (!isDraft) {
      return;
    }
    const nextQty = Math.max(1, qty);

    setLineQtyById((prev) => ({ ...prev, [lineId]: nextQty }));

    const prevTimer = qtySaveTimersRef.current[lineId];

    if (prevTimer) {
      clearTimeout(prevTimer);
    }

    qtySaveTimersRef.current[lineId] = setTimeout(() => {
      void (async () => {
        const res = await updateOrderLine(lineId, { quantity: nextQty });

        if (!res.ok) {
          toast({
            title: t("marketplace.orders.detail.toast-update-qty-failed"),
            description: res.errors.map((e) => e.message).join(", "),
            variant: "destructive",
          });

          return;
        }
        const errs = res.data.orderLineUpdate?.errors ?? [];

        if (errs.length) {
          toast({
            title: t("marketplace.orders.detail.toast-update-qty-failed"),
            description:
              errs
                .map((e) => e.message)
                .filter(Boolean)
                .join(", ") || t("common.toast-unknown-error"),
            variant: "destructive",
          });

          return;
        }
        router.refresh();
      })();
    }, 350);
  };

  const handleRemoveDraftLine = async (lineId: string) => {
    if (!isDraft) {
      return;
    }
    const res = await deleteOrderLine(lineId);

    if (!res.ok) {
      toast({
        title: t("marketplace.orders.detail.toast-remove-item-failed"),
        description: res.errors.map((e) => e.message).join(", "),
        variant: "destructive",
      });

      return;
    }
    const errs = res.data.orderLineDelete?.errors ?? [];

    if (errs.length) {
      toast({
        title: t("marketplace.orders.detail.toast-remove-item-failed"),
        description:
          errs
            .map((e) => e.message)
            .filter(Boolean)
            .join(", ") || t("common.toast-unknown-error"),
        variant: "destructive",
      });

      return;
    }
    router.refresh();
  };

  const handleSaveDraftLinesFromDialog = async (
    selected: VariantLineDraft[],
  ) => {
    if (!isDraft) {
      return;
    }

    const existingLines = (order.lines ?? [])
      .filter(Boolean)
      .filter((l) => Boolean(l.variant?.id));

    const existingByVariantId = new Map(
      existingLines.map((l) => [l.variant!.id, l] as const),
    );

    const selectedVariantIds = new Set(selected.map((l) => l.variantId));

    const toDelete = existingLines
      .filter((l) => !selectedVariantIds.has(l.variant!.id))
      .map((l) => l.id);

    const toAdd = selected
      .filter((l) => !existingByVariantId.has(l.variantId))
      .map((l) => ({ variantId: l.variantId, quantity: l.quantity }));

    const toUpdate = selected
      .map((l) => {
        const existing = existingByVariantId.get(l.variantId);

        if (!existing) {
          return null;
        }
        const currentQty = lineQtyById[existing.id] ?? existing.quantity ?? 1;

        if (l.quantity === currentQty) {
          return null;
        }

        return { lineId: existing.id, quantity: l.quantity };
      })
      .filter((x): x is { lineId: string; quantity: number } => x !== null);

    await Promise.all(toDelete.map((id) => deleteOrderLine(id)));
    if (toAdd.length) {
      await addOrderLines(order.id, toAdd);
    }
    await Promise.all(
      toUpdate.map((u) => updateOrderLine(u.lineId, { quantity: u.quantity })),
    );

    router.refresh();
  };

  return (
    <div className="min-h-screen">
      {/* Sticky header bar */}
      <div className="fixed left-0 right-0 top-16 z-40 border-b bg-background">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="sm" className="gap-2">
              <Link href="/orders">
                <ArrowLeft className="h-4 w-4" />
                {t("marketplace.orders.detail.back-to-orders")}
              </Link>
            </Button>
            <h1 className="text-2xl font-semibold">{order.number}</h1>
            <ColorBadge label={order.status} />
          </div>
          <div className="flex items-center gap-2">
            {isDraft ? (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => void handleDeleteDraft()}
                  disabled={isDeletingDraft}
                >
                  {isDeletingDraft
                    ? t("marketplace.orders.detail.cancelling")
                    : t("common.cancel")}
                </Button>
                <Button
                  size="sm"
                  className="bg-stone-900 hover:bg-stone-800"
                  onClick={() => void handleFinalizeDraft()}
                  disabled={!order.canFinalize || isFinalizing}
                >
                  {isFinalizing
                    ? t("marketplace.orders.detail.finalizing")
                    : t("marketplace.orders.detail.finalize-button")}
                </Button>
              </>
            ) : (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="outline">
                      {t("marketplace.orders.detail.more-actions")}
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {order.status !== "CANCELED" && (
                      <DropdownMenuItem
                        onClick={() => setShowCancelOrderDialog(true)}
                      >
                        {t("marketplace.orders.detail.cancel-order")}
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={handlePrintPackingSlips}>
                      {t("marketplace.orders.detail.print-packing-slips")}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleMessageCustomer}>
                      {t("marketplace.orders.detail.message-customer")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button size="sm" variant="outline" onClick={handleRefund}>
                  {t("marketplace.orders.detail.refund")}
                </Button>
              </>
            )}
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
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <h3 className="text-sm font-medium text-muted-foreground">
                      {t("common.customer")}
                    </h3>
                    {isDraft ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => setIsCustomerDialogOpen(true)}
                      >
                        {t("common.edit")}
                      </Button>
                    ) : null}
                  </div>
                  <p className="font-medium">
                    {[order.user?.firstName, order.user?.lastName]
                      .filter(Boolean)
                      .join(" ") ||
                      order.userEmail ||
                      t("common.not-set")}
                  </p>
                </div>
                <div>
                  <h3 className="mb-2 text-sm font-medium text-muted-foreground">
                    {t("marketplace.orders.detail.contact-information")}
                  </h3>
                  <p className="text-sm">{order.userEmail ?? "—"}</p>
                  {customerPhone && <p className="text-sm">{customerPhone}</p>}
                </div>
                <div>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <h3 className="text-sm font-medium text-muted-foreground">
                      {t("marketplace.orders.detail.shipping-address")}
                    </h3>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setIsShippingAddressDialogOpen(true)}
                    >
                      {t("common.edit")}
                    </Button>
                  </div>
                  <div className="text-sm">
                    {order.shippingAddress
                      ? formatAddress(order.shippingAddress, t)
                      : t("marketplace.orders.detail.no-shipping-address")}
                  </div>
                </div>
                <div>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <h3 className="text-sm font-medium text-muted-foreground">
                      {t("marketplace.orders.detail.billing-address")}
                    </h3>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setIsBillingAddressDialogOpen(true)}
                    >
                      {t("common.edit")}
                    </Button>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {isSameAddress
                      ? t("marketplace.orders.detail.same-as-shipping")
                      : order.billingAddress
                        ? formatAddress(order.billingAddress, t)
                        : t("marketplace.orders.detail.no-billing-address")}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          {isDraft ? (
            <Card>
              <CardContent className="space-y-4 p-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-base font-medium">
                      {t("marketplace.orders.detail.order-lines")}
                    </CardTitle>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {t("marketplace.orders.detail.order-lines-description")}
                    </p>
                  </div>
                  <Button
                    type="button"
                    className="bg-stone-900 hover:bg-stone-800"
                    onClick={() => setIsVariantDialogOpen(true)}
                  >
                    {t("common.add-products")}
                  </Button>
                </div>

                {(order.lines ?? []).length > 0 ? (
                  <div className="space-y-2">
                    {(order.lines ?? []).filter(Boolean).map((line) => (
                      <div
                        key={line.id}
                        className="flex items-center gap-3 rounded-md border px-3 py-2"
                      >
                        {line.thumbnail?.url ? (
                          <div className="relative h-12 w-12 overflow-hidden rounded border">
                            <Image
                              src={line.thumbnail.url}
                              alt={line.thumbnail.alt || line.productName || ""}
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
                              {line.productName || line.variantName || "—"}
                            </div>
                            {line.productName && line.variantName ? (
                              <div className="text-xs text-muted-foreground">
                                {line.variantName}
                              </div>
                            ) : null}

                            <div className="mt-1 flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">
                                {t("common.qty-header")}
                              </span>
                              <Input
                                className="w-20"
                                type="number"
                                min={1}
                                value={lineQtyById[line.id] ?? line.quantity}
                                onChange={(e) => {
                                  const next = parseInt(e.target.value, 10);

                                  handleDraftLineQtyChange(
                                    line.id,
                                    Number.isFinite(next) && next > 0
                                      ? next
                                      : 1,
                                  );
                                }}
                              />
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-1">
                            {line.unitPrice?.gross ? (
                              <>
                                <span className="text-xs text-muted-foreground">
                                  {formatPrice(
                                    line.unitPrice.gross.amount,
                                    line.unitPrice.gross.currency,
                                  )}{" "}
                                  / unit
                                </span>
                                <span className="text-sm font-medium">
                                  {formatPrice(
                                    line.unitPrice.gross.amount *
                                      (lineQtyById[line.id] ?? line.quantity),
                                    line.unitPrice.gross.currency,
                                  )}
                                </span>
                              </>
                            ) : (
                              <span className="text-sm text-muted-foreground">
                                —
                              </span>
                            )}

                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                void handleRemoveDraftLine(line.id)
                              }
                            >
                              {t("common.remove")}
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {t("marketplace.orders.detail.no-line-items")}
                  </p>
                )}
              </CardContent>
            </Card>
          ) : null}

          {/* Items card: Fulfilled + Unfulfilled */}
          {!isDraft ? (
            <Card>
              <CardContent className="p-0">
                {fulfilledLines.length > 0 && (
                  <div className="border-b">
                    <div className="flex items-center justify-between bg-muted/20 px-6 py-4">
                      <CardTitle className="text-base font-medium">
                        {t("marketplace.orders.detail.fulfilled", {
                          count: fulfilledLines.length,
                        })}
                      </CardTitle>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => console.log("View tracking")}
                          >
                            {t("marketplace.orders.detail.view-tracking")}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => console.log("Print shipping label")}
                          >
                            {t(
                              "marketplace.orders.detail.print-shipping-label",
                            )}
                          </DropdownMenuItem>
                          {(() => {
                            const activeFulfillments =
                              order.fulfillments?.filter(
                                (f) =>
                                  f.status !== "CANCELED" && f.warehouse?.id,
                              ) ?? [];

                            return activeFulfillments.map((f, idx) => (
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
                                {t(
                                  "marketplace.orders.detail.cancel-fulfillment",
                                )}
                                {activeFulfillments.length > 1
                                  ? ` #${idx + 1}`
                                  : ""}
                              </DropdownMenuItem>
                            ));
                          })()}
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
                              {formatPrice(
                                line.unitPrice.gross.amount,
                                line.unitPrice.gross.currency,
                              )}{" "}
                              × {line.quantityFulfilled}
                            </span>
                            <span className="font-medium">
                              {formatPrice(
                                line.unitPrice.gross.amount *
                                  line.quantityFulfilled,
                                line.unitPrice.gross.currency,
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
                          ? t("marketplace.orders.detail.unfulfilled", {
                              count: unfulfilledLines.length,
                            })
                          : t("marketplace.orders.detail.fulfilling-items")}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        {order.status !== "CANCELED" &&
                          (!isFulfilling ? (
                            <>
                              <Button
                                size="sm"
                                className="bg-stone-900 hover:bg-stone-800"
                                onClick={() => setIsFulfilling(true)}
                              >
                                {t("marketplace.orders.detail.fulfill-items")}
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() =>
                                      console.log("Create shipping label")
                                    }
                                  >
                                    {t(
                                      "marketplace.orders.detail.create-shipping-label",
                                    )}
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
                              {t("common.cancel")}
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
                                  value={
                                    fulfillmentData[line.id]?.warehouse_id ?? ""
                                  }
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
                                    <SelectValue
                                      placeholder={t(
                                        "marketplace.orders.detail.select-warehouse",
                                      )}
                                    />
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
                                  value={
                                    fulfillmentData[line.id]?.quantity ?? ""
                                  }
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
                                <span className="text-sm text-muted-foreground">
                                  of {line.quantityToFulfill}
                                </span>
                              </div>
                            ) : (
                              <>
                                <span className="text-sm text-muted-foreground">
                                  {formatPrice(
                                    line.unitPrice.gross.amount,
                                    line.unitPrice.gross.currency,
                                  )}{" "}
                                  × {line.quantityToFulfill}
                                </span>
                                <span className="font-medium">
                                  {formatPrice(
                                    (line.unitPrice.gross.amount ?? 0) *
                                      (line.quantityToFulfill ?? 0),
                                    line.unitPrice.gross.currency,
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
                        <h4 className="font-medium">
                          {t("marketplace.orders.detail.tracking-information")}
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="tracking">
                              {t("marketplace.orders.detail.tracking-number")}
                            </Label>
                            <Input
                              id="tracking"
                              value={trackingNumber}
                              onChange={(e) =>
                                setTrackingNumber(e.target.value)
                              }
                              placeholder={t(
                                "marketplace.orders.detail.tracking-placeholder",
                              )}
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
                              {t("marketplace.orders.detail.notify-customer")}
                            </Label>
                          </div>
                          <Button
                            className="bg-stone-900 hover:bg-stone-800"
                            onClick={handleCompleteFulfillment}
                            disabled={
                              fulfillmentLines.length === 0 ||
                              isPendingFulfillment
                            }
                          >
                            {isPendingFulfillment
                              ? t("marketplace.orders.detail.fulfilling-items")
                              : t(
                                  "marketplace.orders.detail.fulfill-order-button",
                                )}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {unfulfilledLines.length === 0 &&
                  fulfilledLines.length === 0 && (
                    <div className="px-6 py-8 text-center text-sm text-muted-foreground">
                      No line items
                    </div>
                  )}
              </CardContent>
            </Card>
          ) : null}

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card>
              <CardContent className="p-6">
                <div className="mb-4">
                  <CardTitle className="text-base font-medium">
                    {t("marketplace.orders.detail.order-summary")}
                  </CardTitle>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {t("marketplace.orders.detail.subtotal")}
                    </span>
                    <div className="text-right">
                      <span className="text-muted-foreground">
                        {itemCount} {itemLabel}
                      </span>
                      <div>
                        {formatPrice(
                          order.subtotal.gross.amount,
                          order.subtotal.gross.currency,
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start justify-between gap-4 text-sm">
                    <span className="text-muted-foreground">
                      {t("common.shipping")}
                    </span>
                    <div className="flex items-start gap-2">
                      <div className="text-right">
                        <div className="text-muted-foreground">
                          {order.shippingMethodName ??
                            order.shippingMethod?.name ??
                            "—"}
                        </div>
                        <div>
                          {order.shippingPrice
                            ? formatPrice(
                                order.shippingPrice.gross.amount,
                                order.shippingPrice.gross.currency,
                              )
                            : "—"}
                        </div>
                      </div>
                      {isDraft ? (
                        <Button
                          type="button"
                          size="sm"
                          className="bg-stone-900 hover:bg-stone-800"
                          onClick={() => setIsShippingDialogOpen(true)}
                          disabled={isLoadingShippingMethods}
                        >
                          {t("common.edit")}
                        </Button>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex items-start justify-between gap-4 text-sm">
                    <span className="text-muted-foreground">
                      {t("common.discounts")}
                    </span>
                    <div className="flex items-start gap-2">
                      <div className="space-y-1 text-right">
                        {(order.discounts ?? []).length === 0 ? (
                          <div className="text-muted-foreground">—</div>
                        ) : (
                          (order.discounts ?? []).map((d) => (
                            <div
                              key={d.id}
                              className="flex items-center justify-end gap-2"
                            >
                              <div className="text-muted-foreground">
                                {d.reason || d.name || t("common.discount")}{" "}
                                {d.valueType === "PERCENTAGE"
                                  ? `(${d.value}%)`
                                  : `(${formatPrice(
                                      d.value,
                                      order.total.gross.currency,
                                    )})`}
                              </div>
                              {isDraft ? (
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    void handleRemoveDiscount(d.id)
                                  }
                                >
                                  {t("common.remove")}
                                </Button>
                              ) : null}
                            </div>
                          ))
                        )}
                      </div>
                      {isDraft ? (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => setIsDiscountDialogOpen(true)}
                        >
                          {t("common.add")}
                        </Button>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex justify-between border-t pt-3 text-base font-semibold">
                    <span>{t("common.total")}</span>
                    <span>
                      {formatPrice(
                        order.total.gross.amount,
                        order.total.gross.currency,
                      )}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={isDraft ? "opacity-60" : undefined}>
              <CardContent className="p-6">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <CardTitle className="text-base font-medium">
                    {t("marketplace.orders.detail.payments-summary")}
                  </CardTitle>
                  {!isDraft && !isFullyCharged ? (
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => setShowMarkAsPaidDialog(true)}
                    >
                      {t("marketplace.orders.detail.mark-as-paid")}
                    </Button>
                  ) : null}
                </div>

                {!isDraft && hasPaymentSummaryData ? (
                  <div className="space-y-4 text-sm">
                    {hasRegisteredTransactions ? (
                      <p className="text-sm text-muted-foreground">
                        All payments from registered transactions.
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Payment status was updated manually.
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-2">
                      {order.paymentStatus === "FULLY_CHARGED" ? (
                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-900">
                          Fully charged
                        </span>
                      ) : null}
                      {order.authorizeStatus === "FULL" ? (
                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-900">
                          Fully authorised
                        </span>
                      ) : null}
                    </div>

                    <div className="space-y-2 pt-1">
                      <div className="flex items-center justify-between gap-4">
                        <span>
                          {t("marketplace.orders.detail.total-captured")}
                        </span>
                        <span>
                          {formatPrice(
                            totalCapturedAmount,
                            order.totalCharged.currency,
                          )}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <span>
                          {t(
                            "marketplace.orders.detail.outstanding-authorized",
                          )}
                        </span>
                        <span>
                          {formatPrice(
                            outstandingAuthorizedAmount,
                            order.totalAuthorized.currency,
                          )}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-4 font-semibold">
                        <span>
                          {t("marketplace.orders.detail.outstanding-balance")}
                        </span>
                        <span>
                          {formatPrice(
                            outstandingBalanceAmount,
                            order.total.gross.currency,
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex min-h-[140px] flex-col items-center justify-center gap-2 rounded-md border border-dashed text-center">
                    <CreditCard className="h-5 w-5 text-muted-foreground" />
                    <p className="text-sm font-medium">
                      {t("marketplace.orders.detail.no-payment-received")}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {t("marketplace.orders.detail.mark-as-paid-manual-hint")}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Bottom content - 2 columns */}
          <div className="grid grid-cols-2 gap-6">
            {/* Timeline */}
            <OrderTimeline
              events={order.events || []}
              currency={order.total.gross.currency}
            />

            {/* Order notes */}
            <OrderNotes
              orderId={order.id}
              events={order.events || []}
              onNoteAdded={() => router.refresh()}
            />
          </div>
        </div>
      </div>

      {/* Draft editing dialogs */}
      <CustomerPickerDialog
        open={isCustomerDialogOpen}
        onOpenChange={setIsCustomerDialogOpen}
        selectedCustomerId={order.user?.id ?? null}
        onPick={(c) => void handlePickCustomer(c)}
      />

      <AddressManageDialog
        open={isShippingAddressDialogOpen}
        onOpenChange={setIsShippingAddressDialogOpen}
        title={t("marketplace.orders.detail.edit-shipping-address")}
        addresses={draftCustomer?.addresses ?? order.user?.addresses ?? []}
        selectedAddressId={
          draftCustomer?.defaultShippingAddress?.id ??
          order.user?.defaultShippingAddress?.id ??
          ""
        }
        countryOptions={order.channel?.countries ?? []}
        initialDraftAddress={orderAddressToDraftAddress(
          order.shippingAddress,
          channelDefaultCountryCode,
        )}
        onSave={({ draftAddress }) =>
          void handleSaveShippingAddress(draftAddress)
        }
      />

      <AddressManageDialog
        open={isBillingAddressDialogOpen}
        onOpenChange={setIsBillingAddressDialogOpen}
        title={t("marketplace.orders.detail.edit-billing-address")}
        addresses={draftCustomer?.addresses ?? order.user?.addresses ?? []}
        selectedAddressId={
          draftCustomer?.defaultBillingAddress?.id ??
          order.user?.defaultBillingAddress?.id ??
          ""
        }
        countryOptions={order.channel?.countries ?? []}
        initialDraftAddress={orderAddressToDraftAddress(
          order.billingAddress,
          channelDefaultCountryCode,
        )}
        onSave={({ draftAddress }) =>
          void handleSaveBillingAddress(draftAddress)
        }
      />

      <VariantSelectionDialog
        open={isVariantDialogOpen}
        onOpenChange={setIsVariantDialogOpen}
        channelName={order.channel?.name ?? undefined}
        channelId={order.channel?.id ?? undefined}
        initialLines={draftVariantLines}
        onSave={(next) => void handleSaveDraftLinesFromDialog(next)}
      />

      <ShippingMethodPickerDialog
        open={isShippingDialogOpen}
        onOpenChange={setIsShippingDialogOpen}
        methods={shippingMethods}
        selectedId={order.shippingMethod?.id ?? ""}
        onPick={(id) => void handlePickShippingMethod(id)}
      />

      <OrderDiscountDialog
        open={isDiscountDialogOpen}
        onOpenChange={setIsDiscountDialogOpen}
        onSubmit={(input) => handleAddDiscount(input)}
      />

      <Dialog
        open={showMarkAsPaidDialog}
        onOpenChange={setShowMarkAsPaidDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t("marketplace.orders.detail.mark-as-paid-dialog-title")}
            </DialogTitle>
            <DialogDescription>
              {t("marketplace.orders.detail.mark-as-paid-dialog-desc")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="transaction-reference">
              {t("marketplace.orders.detail.transaction-reference-label")}
            </Label>
            <Input
              id="transaction-reference"
              value={transactionReference}
              onChange={(e) => setTransactionReference(e.target.value)}
              placeholder={t(
                "marketplace.orders.detail.transaction-reference-placeholder",
              )}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowMarkAsPaidDialog(false)}
              disabled={isMarkingAsPaid}
            >
              {t("common.cancel")}
            </Button>
            <Button
              onClick={() => void handleMarkAsPaid()}
              disabled={isMarkingAsPaid || !transactionReference.trim()}
            >
              {isMarkingAsPaid
                ? t("common.saving")
                : t("marketplace.orders.detail.mark-as-paid")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel order dialog */}
      <Dialog
        open={showCancelOrderDialog}
        onOpenChange={setShowCancelOrderDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t("marketplace.orders.detail.cancel-order-dialog-title")}
            </DialogTitle>
            <DialogDescription>
              {t("marketplace.orders.detail.cancel-order-dialog-description")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCancelOrderDialog(false)}
            >
              {t("marketplace.orders.detail.cancel-order-dialog-no-keep")}
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelOrder}
              disabled={isCancelling}
            >
              {isCancelling
                ? t("marketplace.orders.detail.cancelling")
                : t("marketplace.orders.detail.cancel-order-confirm")}
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
            <DialogTitle>
              {t("marketplace.orders.detail.cancel-fulfillment-dialog-title")}
            </DialogTitle>
            <DialogDescription>
              {t(
                "marketplace.orders.detail.cancel-fulfillment-dialog-description",
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCancelFulfillmentTarget(null)}
            >
              {t("marketplace.orders.detail.cancel-fulfillment-no")}
            </Button>
            <Button
              variant="destructive"
              disabled={!!cancelingFulfillmentId}
              onClick={() => {
                if (cancelFulfillmentTarget) {
                  void handleCancelFulfillmentById(
                    cancelFulfillmentTarget.fulfillmentId,
                    cancelFulfillmentTarget.warehouseId,
                  );
                }
              }}
            >
              {cancelingFulfillmentId
                ? t("marketplace.orders.detail.cancelling")
                : t("marketplace.orders.detail.cancel-fulfillment-confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
