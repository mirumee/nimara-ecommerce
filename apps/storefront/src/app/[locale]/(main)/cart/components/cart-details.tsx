"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

import { type Cart } from "@nimara/domain/objects/Cart";
import { type User } from "@nimara/domain/objects/User";
import { Button } from "@nimara/ui/components/button";
import { useToast } from "@nimara/ui/hooks";

import { ShoppingBag } from "@/components/shopping-bag";
import { clientEnvs } from "@/envs/client";
import { Link } from "@/i18n/routing";
import { revalidateCart } from "@/lib/actions/cart";
import { paths } from "@/lib/paths";
import { type WithRegion } from "@/lib/types";
import { cn } from "@/lib/utils";
import { cartService } from "@/services";
import type { TranslationMessage } from "@/types";

export const CartDetails = ({
  cart,
  region,
  user,
}: { cart: Cart; user: User | null } & WithRegion) => {
  const t = useTranslations();

  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const service = cartService({
    channel: region.market.channel,
    languageCode: region.language.code,
    countryCode: region.market.countryCode,
    apiURI: clientEnvs.NEXT_PUBLIC_SALEOR_API_URL,
  });

  const handleLineQuantityChange = async (lineId: string, quantity: number) => {
    setIsProcessing(true);

    const errors = await service.linesUpdate({
      cartId: cart.id,
      lines: [{ lineId, quantity }],
      options: { next: { tags: [`CHECKOUT:${cart.id}`] } },
    });

    setIsProcessing(false);

    if (errors.length) {
      errors.forEach(({ code }) =>
        toast({
          description: t(`checkout-errors.${code}` as TranslationMessage),
          variant: "destructive",
        }),
      );
    } else {
      await revalidateCart(cart.id);
    }
  };

  const handleLineDelete = async (lineId: string) => {
    setIsProcessing(true);
    const errors = await service.linesDelete({
      cartId: cart.id,
      linesIds: [lineId],
      options: { next: { tags: [`CHECKOUT:${cart.id}`] } },
    });

    setIsProcessing(false);

    if (errors.length) {
      errors.forEach(({ code }) =>
        toast({
          description: t(`checkout-errors.${code}` as TranslationMessage),
          variant: "destructive",
        }),
      );
    } else {
      await revalidateCart(cart.id);
    }
  };

  return (
    <>
      <ShoppingBag>
        <ShoppingBag.Header />
        <ShoppingBag.Lines
          onLineQuantityChange={handleLineQuantityChange}
          onLineDelete={handleLineDelete}
          lines={cart.lines}
          isDisabled={isProcessing}
          unavailableLines={cart.problems.insufficientStock}
        />
        <ShoppingBag.Pricing>
          <ShoppingBag.Subtotal price={cart.subtotal} />
        </ShoppingBag.Pricing>
      </ShoppingBag>
      <div className="w-full text-center">
        <Button
          asChild
          size="lg"
          className="my-8 px-12"
          disabled={isProcessing || !!cart.problems.insufficientStock.length}
          loading={isProcessing}
        >
          <Link
            href={
              !!user ? paths.checkout.asPath() : paths.checkout.signIn.asPath()
            }
            className={cn({ "pointer-events-none": isProcessing })}
          >
            <span className={cn({ hidden: isProcessing })}>
              {t("common.go-to-checkout")}
            </span>
          </Link>
        </Button>
      </div>
    </>
  );
};
