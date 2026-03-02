"use client";

import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

import { type Cart } from "@nimara/domain/objects/Cart";
import { type User } from "@nimara/domain/objects/User";
import { Button } from "@nimara/ui/components/button";
import { useToast } from "@nimara/ui/hooks";

import { ShoppingBag } from "@/components/shopping-bag";
import { CACHE_TTL } from "@/config";
import { LocalizedLink, useRouter } from "@/i18n/routing";
import { revalidateCart } from "@/lib/actions/cart";
import { paths } from "@/lib/paths";
import { type WithRegion } from "@/lib/types";
import { cn } from "@/lib/utils";
import { getCartService } from "@/services/cart";

export const CartDetails = ({
  cart,
  user,
  hasMixedCurrencies = false,
}: {
  cart: Cart;
  hasMixedCurrencies?: boolean;
  user: User | null;
} & WithRegion) => {
  const t = useTranslations();
  const router = useRouter();
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

  const isDisabled = isProcessing || !isCartValid || hasMixedCurrencies;

  const handleLineQuantityChange = async (lineId: string, quantity: number) => {
    setIsProcessing(true);

    const sourceCheckoutId =
      cart.lines.find((line) => line.id === lineId)?.sourceCheckoutId ??
      cart.id;

    const cartService = await getCartService();
    const resultLinesUpdate = await cartService.linesUpdate({
      cartId: sourceCheckoutId,
      lines: [{ lineId, quantity }],
      options: {
        next: {
          tags: [`CHECKOUT:${sourceCheckoutId}`],
          revalidate: CACHE_TTL.cart,
        },
      },
    });

    if (resultLinesUpdate.ok) {
      void revalidateCart(sourceCheckoutId);
      setIsProcessing(false);

      return;
    }

    resultLinesUpdate.errors.forEach((error) => {
      toast({
        description: t(`errors.${error.code}`),
        variant: "destructive",
      });
    });
  };

  const handleLineDelete = async (lineId: string) => {
    setIsProcessing(true);

    const sourceCheckoutId =
      cart.lines.find((line) => line.id === lineId)?.sourceCheckoutId ??
      cart.id;

    const cartService = await getCartService();
    const resultLinesDelete = await cartService.linesDelete({
      cartId: sourceCheckoutId,
      linesIds: [lineId],
      options: { next: { tags: [`CHECKOUT:${sourceCheckoutId}`] } },
    });

    if (resultLinesDelete.ok) {
      void revalidateCart(sourceCheckoutId);
      router.refresh();
    } else {
      resultLinesDelete.errors.forEach((error) => {
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
      void revalidateCart(cart.id);

      toast({
        description: t(`cart.errors.${redirectReason}`),
        variant: "destructive",
      });
    }
  }, [redirectReason]);

  useEffect(() => {
    if (!hasMixedCurrencies) {
      return;
    }

    toast({
      description: t("errors.CHECKOUT_COMPLETE_ERROR"),
      variant: "destructive",
    });
  }, [hasMixedCurrencies]);

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
            href={
              !!user ? paths.checkout.asPath() : paths.checkout.signIn.asPath()
            }
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
