"use client";

import { PlusCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useState } from "react";

import { type Cart } from "@nimara/domain/objects/Cart";
import { type BaseError } from "@nimara/domain/objects/Error";
import { LocalizedLink } from "@nimara/i18n/routing";
import { type MessagePath } from "@nimara/i18n/types";
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

import { type AddToBagAction } from "../types";

type AddToBagProps = {
  addToBagAction: AddToBagAction;
  cart: Cart | null;
  cartPath: string;
  isVariantAvailable: boolean;
  productVendorId: string | null;
  variantId: string;
};

export const AddToBag = ({
  variantId,
  isVariantAvailable,
  productVendorId,
  cart,
  cartPath,
  addToBagAction,
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
          .map((line) => line.product.vendorId)
          .find((vendorId): vendorId is string => vendorId != null) ?? null;

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
      clientProductVendorId: productVendorId,
      variantId,
    });

    const vendorErrorCodes = [
      "VENDOR_MISMATCH_ERROR",
      "VENDOR_MIX_NOT_ALLOWED_ERROR",
    ];

    if (!resultLinesAdd.ok) {
      if (
        marketplaceEnabled &&
        resultLinesAdd.errors.some((error) =>
          vendorErrorCodes.includes(error.code),
        )
      ) {
        setShowVendorMismatchModal(true);
        setIsProcessing(false);

        return;
      }

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
    <>
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
