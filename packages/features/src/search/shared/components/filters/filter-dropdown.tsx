"use client";

import { useTranslations } from "next-intl";

import type { MessagePath } from "@nimara/i18n/types";
import type { Facet } from "@nimara/infrastructure/use-cases/search/types";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@nimara/ui/components/select";

export const FilterDropdown = ({
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
  const filterName =
    (messageKey ? t(messageKey as MessagePath) : undefined) ?? name;
  const defaultValue = choices?.find((choice) => choice.value === value)?.value;

  return (
    <Select
      defaultValue={defaultValue}
      name={slug}
      onOpenChange={(open) => {
        if (!open) {
          onCommit?.();
        }
      }}
      onValueChange={(nextValue) => onValueChange?.(slug, nextValue)}
    >
      <SelectTrigger>
        <SelectValue placeholder={filterName} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {choices?.map((choice) => (
            <SelectItem key={choice.value} value={choice.value}>
              {choice.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};
