"use client";

import { useTranslations } from "next-intl";
import { useRef } from "react";

import type { MessagePath } from "@nimara/i18n/types";
import type { Facet } from "@nimara/infrastructure/use-cases/search/types";
import { MultiSelect } from "@nimara/ui/components/multi-select";

export const FilterMultiSelect = ({
  facet: { name, choices, slug, messageKey },
  value,
  onCommit,
  onValueChange,
}: {
  facet: Facet;
  onCommit?: () => void;
  onValueChange?: (slug: string, value: string) => void;
  value?: string;
}) => {
  const t = useTranslations();
  const isOpenRef = useRef(false);
  const filterName =
    (messageKey ? t(messageKey as MessagePath) : undefined) ?? name;
  const selectedValues =
    value
      ?.split(",")
      .filter((val) => choices.some((choice) => choice.value === val)) ?? [];

  return (
    <MultiSelect
      name={slug}
      placeholder={filterName}
      options={choices}
      defaultValue={selectedValues}
      onOpenChange={(open) => {
        isOpenRef.current = open;

        if (!open) {
          onCommit?.();
        }
      }}
      onValueChange={(values) => {
        onValueChange?.(slug, values.join(","));

        /**
         * Removing a value from the closed trigger never opens the popup, so
         * closing it is not going to report that this change is settled.
         */
        if (!isOpenRef.current) {
          onCommit?.();
        }
      }}
    />
  );
};
