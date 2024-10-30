"use client";

import { PlusCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useRef, useState } from "react";

import type { Cart } from "@nimara/domain/objects/Cart";
import type { User } from "@nimara/domain/objects/User";
import { Button } from "@nimara/ui/components/button";
import { ToastAction } from "@nimara/ui/components/toast";
import { useToast } from "@nimara/ui/hooks";

import { clientEnvs } from "@/envs/client";
import { Link } from "@/i18n/routing";
import { revalidateCart, setCheckoutIdCookie } from "@/lib/actions/cart";
import { paths } from "@/lib/paths";
import { cn } from "@/lib/utils";
import { useCurrentRegion } from "@/regions/client";
import { cartService } from "@/services";
import type { TranslationMessage } from "@/types";

type AddToBagProps = {
  cart: Cart | null;
  isVariantAvailable: boolean;
  user: (User & { accessToken: string | undefined }) | null;
  variantId: string;
};

export const AddToBag = ({
  variantId,
  cart,
  isVariantAvailable,
  user,
}: AddToBagProps) => {
  const t = useTranslations();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const succeededRef = useRef(false);

  const cartHref = paths.cart.asPath();
  const region = useCurrentRegion();

  const service = cartService({
    apiURI: clientEnvs.NEXT_PUBLIC_SALEOR_API_URL,
    countryCode: region.market.countryCode,
    channel: region.market.channel,
    languageCode: region.language.code,
  });

  const handleProductAdd = async () => {
    setIsProcessing(true);
    const { cartId, errors } = await service.linesAdd({
      email: user?.email,
      cartId: cart?.id ?? null,
      lines: [{ variantId, quantity: 1 }],
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
      succeededRef.current = true;
    }

    if (cart) {
      await revalidateCart(cart.id);
    }

    if (cartId) {
      await setCheckoutIdCookie(cartId);
    }

    showSuccessMessage();
  };

  const handleNotifyMe = useCallback(async () => {
    return toast({
      title: t("errors.product.NOT_AVAILABLE"),
      description: t("errors.product.VARIANT_NOT_AVAILABLE"),
      variant: "destructive",
    });
  }, []);

  const showSuccessMessage = () => {
    toast({
      description: t("common.product-added"),
      action: (
        <ToastAction altText={t("common.go-to-bag")} asChild>
          <Link href={cartHref} className="whitespace-nowrap">
            {t("common.go-to-bag")}
          </Link>
        </ToastAction>
      ),
    });
  };

  return (
    <Button
      className="my-4 w-full"
      disabled={!variantId || isProcessing}
      onClick={isVariantAvailable ? handleProductAdd : handleNotifyMe}
      loading={isProcessing}
    >
      <div
        className={cn("inline-flex items-center", {
          hidden: isProcessing,
        })}
      >
        {isVariantAvailable ? (
          <>
            <PlusCircle className="mr-2 h-4" />
            {t("common.add-to-bag")}
          </>
        ) : (
          t("common.notify-me")
        )}
      </div>
    </Button>
  );
};
