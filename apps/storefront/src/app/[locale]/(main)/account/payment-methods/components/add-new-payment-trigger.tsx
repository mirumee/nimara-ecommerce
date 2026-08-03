"use client";

import { PlusIcon } from "lucide-react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { cn } from "@nimara/foundation/lib/cn";
import { Button } from "@nimara/ui/components/button";

const PaymentMethodAddModal = dynamic(
  () =>
    import("./payment-method-add-modal").then((mod) => ({
      default: mod.PaymentMethodAddModal,
    })),
  {
    ssr: false,
  },
);

export const AddNewPaymentTrigger = ({
  variant,
  storeUrl,
}: {
  storeUrl: string;
  variant: "outline" | "default";
}) => {
  const t = useTranslations();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        variant={variant}
        disabled={isOpen}
        className={cn("flex gap-1.5", {
          "text-primary": variant === "outline",
        })}
      >
        <PlusIcon className="size-4" />
        <span className="max-sm:hidden">{t("payment.add-new-method")}</span>
      </Button>

      {isOpen && (
        <PaymentMethodAddModal
          onClose={() => setIsOpen(false)}
          storeUrl={storeUrl}
        />
      )}
    </>
  );
};
