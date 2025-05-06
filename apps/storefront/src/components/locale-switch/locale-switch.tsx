"use client";

import { Globe } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { Button } from "@nimara/ui/components/button";

import type { Region } from "@/regions/types";

import { LocaleSwitchModal } from "./locale-modal";

export const LocaleSwitch = ({ region }: { region: Region }) => {
  const [showModal, setShowModal] = useState(false);
  const t = useTranslations("locale");

  return (
    <>
      <Button
        variant="ghost"
        size="default"
        className="gap-1.5"
        onClick={() => setShowModal(true)}
        aria-label={t("region-settings")}
      >
        <Globe className="h-4 w-4" /> {region.market.id.toLocaleUpperCase()}
      </Button>
      {showModal && (
        <LocaleSwitchModal
          region={region}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
};

LocaleSwitch.displayName = "LocaleSwitch";
