"use client";

import { PlusCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useState } from "react";

import type { User } from "@nimara/domain/objects/User";
import { Button } from "@nimara/ui/components/button";
import { ToastAction } from "@nimara/ui/components/toast";
import { useToast } from "@nimara/ui/hooks";

import { Link } from "@/i18n/routing";
import { paths } from "@/lib/paths";
import type { TranslationMessage } from "@/types";

import { addToBagAction } from "../_actions/add-to-bag";

type AddToBagProps = {
  isVariantAvailable: boolean;
  user: (User & { accessToken: string | undefined }) | null;
  variantId: string;
};

export const AddToBag = ({
  variantId,
  isVariantAvailable,
  user,
}: AddToBagProps) => {
  const t = useTranslations();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleProductAdd = async () => {
    setIsProcessing(true);

    const resultLinesAdd = await addToBagAction({
      user,
      variantId,
    });

    if (!resultLinesAdd.ok) {
      resultLinesAdd.errors.forEach((error) => {
        if (error.field) {
          toast({
            description: t(
              `checkout-errors.${error.field}` as TranslationMessage,
            ),
            variant: "destructive",
          });
        }
      });
    } else {
      toast({
        description: t("common.product-added"),
        action: (
          <ToastAction altText={t("common.go-to-bag")} asChild>
            <Link href={paths.cart.asPath()} className="whitespace-nowrap">
              {t("common.go-to-bag")}
            </Link>
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
      className="my-4 w-full"
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
