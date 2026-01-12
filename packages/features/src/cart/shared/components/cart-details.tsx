"use client";

import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

import { type Cart } from "@nimara/domain/objects/Cart";
import type { AsyncResult } from "@nimara/domain/objects/Result";
import { type User } from "@nimara/domain/objects/User";
import { ShoppingBag } from "@nimara/features/shared/shopping-bag/shopping-bag";
import {
  useLocalizedLink,
  useLocalizedRouter,
} from "@nimara/foundation/i18n/hooks/use-localized-link";
import { Button } from "@nimara/ui/components/button";
import { useToast } from "@nimara/ui/hooks";
import { cn } from "@nimara/ui/lib/utils";

export interface CartDetailsProps {
  cart: Cart;
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
  };
  user: User | null;
}

export const CartDetails = ({
  cart,
  user,
  onLineQuantityChange,
  onLineDelete,
  onCartUpdate,
  paths,
}: CartDetailsProps) => {
  const t = useTranslations();
  const router = useLocalizedRouter();
  const LocalizedLink = useLocalizedLink();
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const params = useSearchParams();
  const redirectReason = params.get("redirectReason") as
    | "INSUFFICIENT_STOCK"
    | "VARIANT_NOT_AVAILABLE"
    | null;

  const prevCartVersion = useRef(cart.lines.length);
  const isCartValid = ![
    ...cart.problems.insufficientStock,
    ...cart.problems.variantNotAvailable,
  ].length;

  const isDisabled = isProcessing || !isCartValid;

  const handleLineQuantityChange = async (lineId: string, quantity: number) => {
    setIsProcessing(true);

    const result = await onLineQuantityChange({
      cartId: cart.id,
      lineId,
      quantity,
    });

    if (result.ok) {
      await onCartUpdate(cart.id);
      setIsProcessing(false);

      return;
    }

    result.errors.forEach((error) => {
      toast({
        description: t(`errors.${error.code}`),
        variant: "destructive",
      });
    });
  };

  const handleLineDelete = async (lineId: string) => {
    setIsProcessing(true);

    const result = await onLineDelete({
      cartId: cart.id,
      lineId,
    });

    if (result.ok) {
      await onCartUpdate(cart.id);
      router.refresh();
    } else {
      result.errors.forEach((error) => {
        toast({
          description: t(`errors.${error.code}`),
          variant: "destructive",
        });
      });
      setIsProcessing(false);
    }
  };

  // Unblock UI when cart updates
  useEffect(() => {
    const cartVersion = cart.lines.length;

    if (isProcessing && prevCartVersion.current !== cartVersion) {
      setIsProcessing(false);
      prevCartVersion.current = cartVersion;
    }
  }, [cart, isProcessing]);

  useEffect(() => {
    if (redirectReason) {
      void onCartUpdate(cart.id);

      toast({
        description: t(`cart.errors.${redirectReason}`),
        variant: "destructive",
      });
    }
  }, [redirectReason, cart.id, toast, t, onCartUpdate]);

  return (
    <div className="space-y-12">
      <ShoppingBag>
        <ShoppingBag.Header />
        <ShoppingBag.Lines
          onLineQuantityChange={handleLineQuantityChange}
          onLineDelete={handleLineDelete}
          problems={cart.problems}
          lines={cart.lines}
          isDisabled={isProcessing}
        />
        <ShoppingBag.Pricing>
          <ShoppingBag.Subtotal price={cart.subtotal} />
        </ShoppingBag.Pricing>
      </ShoppingBag>
      <div className="w-full text-center">
        <Button asChild size="lg" disabled={isDisabled} loading={isProcessing}>
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
