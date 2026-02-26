"use client";

import { PlusCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useState } from "react";

import { type Cart } from "@nimara/domain/objects/Cart";
import { Button } from "@nimara/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@nimara/ui/components/dialog";
import { ToastAction } from "@nimara/ui/components/toast";
import { useToast } from "@nimara/ui/hooks";

import { LocalizedLink } from "@/i18n/routing";
import { paths } from "@/lib/paths";
import type { TranslationMessage } from "@/types";

import { addToBagAction } from "../actions/add-to-bag";

type AddToBagProps = {
  cart: Cart | null;
  isVariantAvailable: boolean;
  productVendorId: string | null;
  variantId: string;
};

export const AddToBag = ({
  variantId,
  isVariantAvailable,
  productVendorId,
  cart,
}: AddToBagProps) => {
  const t = useTranslations();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showVendorMismatchModal, setShowVendorMismatchModal] = useState(false);

  const marketplaceEnabled =
    process.env.NEXT_PUBLIC_MARKETPLACE_ENABLED !== "false";

  const handleProductAdd = async () => {
    if (marketplaceEnabled && cart?.lines?.length) {
      const cartVendorId =
        cart.lines
          .map((l) => l.product.vendorId)
          .find((v): v is string => v != null) ?? null;

      const vendorMix =
        (cartVendorId !== null && productVendorId === null) ||
        (cartVendorId === null && productVendorId !== null);
      const vendorMismatch =
        cartVendorId !== null &&
        productVendorId !== null &&
        cartVendorId !== productVendorId;

      if (vendorMix || vendorMismatch) {
        setShowVendorMismatchModal(true);

        return;
      }
    }

    setIsProcessing(true);

    const resultLinesAdd = await addToBagAction({
      variantId,
      clientProductVendorId: productVendorId,
    });

    const VENDOR_ERROR_CODES = [
      "VENDOR_MISMATCH_ERROR",
      "VENDOR_MIX_NOT_ALLOWED_ERROR",
    ];

    if (!resultLinesAdd.ok) {
      if (
        marketplaceEnabled &&
        resultLinesAdd.errors.some((e) => VENDOR_ERROR_CODES.includes(e.code))
      ) {
        setShowVendorMismatchModal(true);
      } else {
        resultLinesAdd.errors.forEach((error) => {
          if ("field" in error && error.field) {
            toast({
              description: t(
                `checkout-errors.${error.field}` as TranslationMessage,
              ),
              variant: "destructive",
            });
          }
        });
      }
    } else {
      toast({
        description: t("common.product-added"),
        action: (
          <ToastAction altText={t("common.go-to-bag")} asChild>
            <LocalizedLink
              href={paths.cart.asPath()}
              className="whitespace-nowrap"
            >
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
    <>
      <Button
        className="w-full"
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

      {marketplaceEnabled && (
        <Dialog
          open={showVendorMismatchModal}
          onOpenChange={setShowVendorMismatchModal}
        >
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{t("cart.vendor-restriction-title")}</DialogTitle>
            </DialogHeader>
            <DialogDescription asChild>
              <div>
                <p>{t("cart.vendor-restriction-description")}</p>
                <p className="mt-3">{t("cart.vendor-restriction-temporary")}</p>
              </div>
            </DialogDescription>
            <DialogFooter>
              <Button onClick={() => setShowVendorMismatchModal(false)}>
                {t("common.close")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};
