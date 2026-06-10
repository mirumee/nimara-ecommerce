"use client";

import { PlusCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useState } from "react";

import { type Price } from "@nimara/domain/objects/common";
import { type BaseError } from "@nimara/domain/objects/Error";
import { type Product } from "@nimara/domain/objects/Product";
import { LocalizedLink } from "@nimara/i18n/routing";
import { type MessagePath } from "@nimara/i18n/types";
import { getTrackingService } from "@nimara/infrastructure/tracking/service";
import { Button } from "@nimara/ui/components/button";
import { ToastAction } from "@nimara/ui/components/toast";
import { useToast } from "@nimara/ui/hooks";

import { type AddToBagAction } from "../types";

const tracking = getTrackingService();

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
  const [isProcessing, setIsProcessing] = useState(false);

  const handleProductAdd = async () => {
    setIsProcessing(true);

    const resultLinesAdd = await addToBagAction({
      clientProductVendorId: productVendorId,
      variantId,
    });

    if (!resultLinesAdd.ok) {
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
    } else {
      if (price) {
        void tracking.trackAddToCart({ product, price, quantity: 1 });
      }

      toast({
        description: t("common.product-added"),
        action: (
          <ToastAction altText={t("common.go-to-bag")} asChild>
            <LocalizedLink href={cartPath} className="whitespace-nowrap">
              {t("common.go-to-bag")}
            </LocalizedLink>
          </ToastAction>
        ),
      });
    }

    setIsProcessing(false);
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
      disabled={!variantId || isProcessing}
      onClick={isVariantAvailable ? handleProductAdd : handleNotifyMe}
      loading={isProcessing}
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
