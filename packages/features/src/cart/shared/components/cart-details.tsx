"use client";

import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  useEffect,
  useOptimistic,
  useRef,
  useState,
  useTransition,
} from "react";

import { type Cart } from "@nimara/domain/objects/Cart";
import type { AsyncResult } from "@nimara/domain/objects/Result";
import { type User } from "@nimara/domain/objects/User";
import { EmptyCart } from "@nimara/features/cart/shared/components/empty-cart";
import { applyOptimisticCartAction } from "@nimara/features/cart/shared/optimistic";
import { useCartCount } from "@nimara/features/cart/shared/providers/cart-count-provider";
import { ShoppingBag } from "@nimara/features/shared/shopping-bag/shopping-bag";
import { LocalizedLink } from "@nimara/i18n/routing";
import { getTrackingService } from "@nimara/infrastructure/tracking/service";
import { Button } from "@nimara/ui/components/button";
import { useToast } from "@nimara/ui/hooks";
import { cn } from "@nimara/ui/lib/utils";

const tracking = getTrackingService();

const QUANTITY_REQUEST_DELAY_MS = 500;

export interface CartDetailsProps {
  cart: Cart;
  isMarketplaceEnabled?: boolean;
  lineCheckoutIdMap?: Record<string, string>;
  onCartUpdate: (cartId: string) => Promise<void>;
  onLineDelete: (params: {
    cartId: string;
    lineId: string;
  }) => AsyncResult<{ success: true }>;
  onLineQuantityChange: (params: {
    cartId: string;
    lineId: string;
    quantity: number;
  }) => AsyncResult<{ success: true }>;
  paths: {
    checkout: string;
    checkoutSignIn: string;
    home: string;
  };
  user: User | null;
  vendorIdNames?: Record<string, string>;
}

export const CartDetails = ({
  cart,
  isMarketplaceEnabled,
  user,
  vendorIdNames,
  lineCheckoutIdMap,
  onLineQuantityChange,
  onLineDelete,
  onCartUpdate,
  paths,
}: CartDetailsProps) => {
  const t = useTranslations();
  const { toast } = useToast();
  const params = useSearchParams();
  const redirectReason = params.get("redirectReason") as
    "INSUFFICIENT_STOCK" | "VARIANT_NOT_AVAILABLE" | null;

  const [optimisticCart, applyOptimistic] = useOptimistic(
    cart,
    applyOptimisticCartAction,
  );
  const [, startTransition] = useTransition();
  const requestedQuantities = useRef(new Map<string, number>());
  const { applyCountDelta } = useCartCount();

  const inFlightRequests = useRef(0);
  const [isMutating, setIsMutating] = useState(false);

  const beginRequest = () => {
    inFlightRequests.current += 1;
    setIsMutating(true);
  };

  const endRequest = () => {
    inFlightRequests.current = Math.max(inFlightRequests.current - 1, 0);

    if (!inFlightRequests.current) {
      setIsMutating(false);
    }
  };

  const isCartValid = ![
    ...cart.problems.insufficientStock,
    ...cart.problems.variantNotAvailable,
  ].length;

  const isDisabled = isMutating || !isCartValid;
  const resolveCheckoutIdForLine = (lineId: string): string =>
    lineCheckoutIdMap?.[lineId] ?? cart.id;

  const showErrors = (errors: { code: string }[]) =>
    errors.forEach((error) => {
      toast({
        description: t(`errors.${error.code}`),
        variant: "destructive",
      });
    });

  const handleLineQuantityChange = async (lineId: string, quantity: number) => {
    const checkoutId = resolveCheckoutIdForLine(lineId);
    const line = cart.lines.find((entry) => entry.id === lineId);

    requestedQuantities.current.set(lineId, quantity);
    beginRequest();

    startTransition(async () => {
      applyOptimistic({ type: "update", lineId, quantity });

      applyCountDelta(lineId, quantity - (line?.quantity ?? 0));

      await new Promise((resolve) =>
        setTimeout(resolve, QUANTITY_REQUEST_DELAY_MS),
      );

      if (requestedQuantities.current.get(lineId) !== quantity) {
        endRequest();

        return;
      }

      requestedQuantities.current.delete(lineId);

      const result = await onLineQuantityChange({
        cartId: checkoutId,
        lineId,
        quantity,
      });

      endRequest();

      if (!result.ok) {
        showErrors(result.errors);

        return;
      }

      if (line && quantity !== line.quantity) {
        const isQuantityAdd = quantity > line.quantity;
        const changedQuantity = Math.abs(quantity - line.quantity);
        const unitAmount = line.total.amount / line.quantity;

        if (isQuantityAdd) {
          void tracking.trackAddToCart({
            product: line.product,
            price: { amount: unitAmount, currency: line.total.currency },
            quantity: changedQuantity,
          });
        } else {
          void tracking.trackRemoveFromCart({
            line: {
              ...line,
              quantity: changedQuantity,
              total: { ...line.total, amount: unitAmount * changedQuantity },
            },
          });
        }
      }

      await onCartUpdate(checkoutId);
    });
  };

  const handleLineDelete = async (lineId: string) => {
    if (!optimisticCart.lines.some((line) => line.id === lineId)) {
      return;
    }

    const checkoutId = resolveCheckoutIdForLine(lineId);
    const deletedLine = cart.lines.find((line) => line.id === lineId);

    requestedQuantities.current.delete(lineId);
    beginRequest();

    startTransition(async () => {
      applyOptimistic({ type: "delete", lineId });
      applyCountDelta(lineId, -(deletedLine?.quantity ?? 0));

      const result = await onLineDelete({ cartId: checkoutId, lineId });

      endRequest();

      if (!result.ok) {
        showErrors(result.errors);

        return;
      }

      if (deletedLine) {
        void tracking.trackRemoveFromCart({ line: deletedLine });
      }

      await onCartUpdate(checkoutId);
    });
  };

  useEffect(() => {
    void tracking.trackViewCart({ cart });
  }, []);

  useEffect(() => {
    if (redirectReason) {
      void onCartUpdate(cart.id);

      toast({
        description: t(`cart.errors.${redirectReason}`),
        variant: "destructive",
      });
    }
  }, [redirectReason, cart.id, toast, t, onCartUpdate]);

  if (!optimisticCart.lines.length) {
    return <EmptyCart paths={{ home: paths.home }} />;
  }

  return (
    <div className="space-y-12">
      <ShoppingBag>
        <ShoppingBag.Header />
        <ShoppingBag.Lines
          isMarketplaceEnabled={isMarketplaceEnabled}
          onLineQuantityChange={handleLineQuantityChange}
          onLineDelete={handleLineDelete}
          problems={cart.problems}
          vendorIdNames={vendorIdNames}
          lines={optimisticCart.lines}
        />

        <hr className="border-stone-200" />

        <ShoppingBag.Pricing>
          <ShoppingBag.Subtotal price={optimisticCart.subtotal} />
        </ShoppingBag.Pricing>
      </ShoppingBag>
      <div className="w-full text-center">
        <Button asChild size="lg" disabled={isDisabled} loading={isMutating}>
          <LocalizedLink
            href={!!user ? paths.checkout : paths.checkoutSignIn}
            className={cn({
              "pointer-events-none opacity-50": isDisabled,
            })}
          >
            {t("common.go-to-checkout")}
          </LocalizedLink>
        </Button>
      </div>
    </div>
  );
};
