"use client";

import { PlusCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useState } from "react";

import { type BaseError } from "@nimara/domain/objects/Error";
import { LocalizedLink } from "@nimara/i18n/routing";
import { type MessagePath } from "@nimara/i18n/types";
import { Button } from "@nimara/ui/components/button";
import { ToastAction } from "@nimara/ui/components/toast";
import { useToast } from "@nimara/ui/hooks";

import { type AddToBagAction } from "../types";

type AddToBagProps = {
  addToBagAction: AddToBagAction;
  cartPath: string;
  isVariantAvailable: boolean;
  variantId: string;
};

export const AddToBag = ({
  variantId,
  isVariantAvailable,
  cartPath,
  addToBagAction,
}: AddToBagProps) => {
  const t = useTranslations();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleProductAdd = async () => {
    setIsProcessing(true);

    const resultLinesAdd = await addToBagAction({
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
  );
};
