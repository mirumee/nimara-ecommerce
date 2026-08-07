"use client";

import { PlusCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useRef, useTransition } from "react";

import { type Price } from "@nimara/domain/objects/common";
import { type BaseError } from "@nimara/domain/objects/Error";
import { type Product } from "@nimara/domain/objects/Product";
import { useCartCount } from "@nimara/features/cart/shared/providers/cart-count-provider";
import { LocalizedLink } from "@nimara/i18n/routing";
import { type MessagePath } from "@nimara/i18n/types";
import { getTrackingService } from "@nimara/infrastructure/tracking/service";
import { Button } from "@nimara/ui/components/button";
import { ToastAction } from "@nimara/ui/components/toast";
import { useToast } from "@nimara/ui/hooks";

import { type AddToBagAction } from "../types";

const tracking = getTrackingService();

const ADD_TO_BAG_BATCH_DELAY_MS = 400;

let pendingAddRequests: Promise<unknown> = Promise.resolve();

type PendingAdd = { key: string; quantity: number; variantId: string };

type AddToBagProps = {
  addToBagAction: AddToBagAction;
  cartPath: string;
  isVariantAvailable: boolean;
  price?: Price;
  product: Pick<Product, "id" | "name">;
  productVendorId: string | null;
  variantId: string;
};

export const AddToBag = ({
  variantId,
  isVariantAvailable,
  productVendorId,
  cartPath,
  addToBagAction,
  product,
  price,
}: AddToBagProps) => {
  const t = useTranslations();
  const { toast } = useToast();
  const [, startTransition] = useTransition();
  const { applyCountDelta } = useCartCount();
  const batchCounter = useRef(0);
  const pendingAdd = useRef<PendingAdd | null>(null);

  const handleProductAdd = () => {
    // Switching variants ends the current batch rather than adding to it.
    const batch =
      pendingAdd.current?.variantId === variantId
        ? pendingAdd.current
        : {
            key: `add:${variantId}:${(batchCounter.current += 1)}`,
            quantity: 0,
            variantId,
          };
    const quantity = batch.quantity + 1;

    pendingAdd.current = { ...batch, quantity };

    const addedToast = toast({
      description: t("common.product-added"),
      action: (
        <ToastAction altText={t("common.go-to-bag")} asChild>
          <LocalizedLink href={cartPath} className="whitespace-nowrap">
            {t("common.go-to-bag")}
          </LocalizedLink>
        </ToastAction>
      ),
    });

    startTransition(async () => {
      applyCountDelta(batch.key, quantity);

      await new Promise((resolve) =>
        setTimeout(resolve, ADD_TO_BAG_BATCH_DELAY_MS),
      );

      if (
        pendingAdd.current?.key !== batch.key ||
        pendingAdd.current.quantity !== quantity
      ) {
        return;
      }

      pendingAdd.current = null;

      const request = pendingAddRequests.then(() =>
        addToBagAction({
          clientProductVendorId: productVendorId,
          variantId,
          quantity,
        }),
      );

      pendingAddRequests = request.catch(() => undefined);

      const resultLinesAdd = await request;

      if (!resultLinesAdd.ok) {
        addedToast.dismiss();

        resultLinesAdd.errors.forEach((error: BaseError) => {
          if (error.field) {
            toast({
              description: t(`errors.${error.field}` as MessagePath),
              variant: "destructive",
            });
          } else {
            toast({
              description: t(`errors.${error.code}` as MessagePath),
              variant: "destructive",
            });
          }
        });

        return;
      }

      if (price) {
        void tracking.trackAddToCart({ product, price, quantity });
      }
    });
  };

  const handleNotifyMe = useCallback(async () => {
    return toast({
      title: t("errors.product.NOT_AVAILABLE"),
      description: t("errors.product.VARIANT_NOT_AVAILABLE"),
      variant: "destructive",
    });
  }, []);

  return (
    <Button
      className="w-full transition-[background-color]"
      disabled={!variantId}
      onClick={isVariantAvailable ? handleProductAdd : handleNotifyMe}
    >
      {isVariantAvailable ? (
        <>
          <PlusCircle className="mr-2 h-4" />
          {t("common.add-to-bag")}
        </>
      ) : (
        t("common.notify-me")
      )}
    </Button>
  );
};
