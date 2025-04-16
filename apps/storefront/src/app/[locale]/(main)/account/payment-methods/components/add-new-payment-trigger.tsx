"use client";

import { PlusIcon } from "lucide-react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { Button } from "@nimara/ui/components/button";
import { Spinner } from "@nimara/ui/components/spinner";

import { storefrontLogger } from "@/services/logging";

import { generateSecretAction } from "../actions";

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
  customerId,
  storeUrl,
}: {
  customerId: string;
  storeUrl: string;
  variant: "outline" | "default";
}) => {
  const t = useTranslations();
  const [secret, setSecret] = useState<string | null>(null);

  const handleGenerateSecret = async () => {
    const resultGenerateSecret = await generateSecretAction({ customerId });

    if (!resultGenerateSecret.ok) {
      storefrontLogger.error("Error generating payment method secret", {
        errors: resultGenerateSecret.errors,
      });

      return;
    }

    setSecret(resultGenerateSecret.data.secret);
  };

  const handleClose = () => setSecret(null);

  return (
    <>
      <Button
        onClick={handleGenerateSecret}
        variant={variant}
        disabled={!!secret}
        className="flex gap-1.5"
      >
        {secret ? (
          <Spinner className="size-4" />
        ) : (
          <PlusIcon className="size-4" />
        )}
        <span className="max-sm:hidden">{t("payment.add-new-method")}</span>
      </Button>

      {secret && (
        <PaymentMethodAddModal
          onClose={handleClose}
          secret={secret}
          storeUrl={storeUrl}
        />
      )}
    </>
  );
};
