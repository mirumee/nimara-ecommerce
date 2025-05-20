"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

import { type Cart } from "@nimara/domain/objects/Cart";
import { type User } from "@nimara/domain/objects/User";
import { Button } from "@nimara/ui/components/button";
import { useToast } from "@nimara/ui/hooks";

import { ShoppingBag } from "@/components/shopping-bag";
import { CACHE_TTL } from "@/config";
import { clientEnvs } from "@/envs/client";
import { Link, useRouter } from "@/i18n/routing";
import { revalidateCart } from "@/lib/actions/cart";
import { paths } from "@/lib/paths";
import { type WithRegion } from "@/lib/types";
import { cartService } from "@/services";
import { storefrontLogger } from "@/services/logging";

export const CartDetails = ({
  cart,
  region,
  user,
}: { cart: Cart; user: User | null } & WithRegion) => {
  const t = useTranslations();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const prevCartVersion = useRef(cart.lines.length);

  const service = cartService({
    channel: region.market.channel,
    languageCode: region.language.code,
    countryCode: region.market.countryCode,
    apiURI: clientEnvs.NEXT_PUBLIC_SALEOR_API_URL,
    logger: storefrontLogger,
  });

  const handleLineQuantityChange = async (lineId: string, quantity: number) => {
    setIsProcessing(true);

    const resultLinesUpdate = await service.linesUpdate({
      cartId: cart.id,
      lines: [{ lineId, quantity }],
      options: {
        next: { tags: [`CHECKOUT:${cart.id}`], revalidate: CACHE_TTL.cart },
      },
    });

    setIsProcessing(false);

    if (resultLinesUpdate.ok) {
      await revalidateCart(cart.id);

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
    const resultLinesDelete = await service.linesDelete({
      cartId: cart.id,
      linesIds: [lineId],
      options: { next: { tags: [`CHECKOUT:${cart.id}`] } },
    });

    if (resultLinesDelete.ok) {
      await revalidateCart(cart.id);
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

  return (
    <div className="space-y-12">
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
          disabled={isProcessing || !!cart.problems.insufficientStock.length}
          loading={isProcessing}
        >
          <Link
            href={
              !!user ? paths.checkout.asPath() : paths.checkout.signIn.asPath()
            }
          >
            {t("common.go-to-checkout")}
          </Link>
        </Button>
      </div>
    </div>
  );
};
