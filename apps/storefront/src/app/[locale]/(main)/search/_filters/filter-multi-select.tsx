import { getTranslations } from "next-intl/server";

import type { Facet } from "@nimara/infrastructure/use-cases/search/types";
import { MultiSelect } from "@nimara/ui/components/multi-select";

import type { TranslationMessage } from "@/types";

export const FilterMultiSelect = async ({
  facet: { name, choices, slug, messageKey },
  searchParams,
}: {
  facet: Facet;
  searchParams: Record<string, string>;
}) => {
  const t = await getTranslations();
  const filterName = name ?? t(messageKey as TranslationMessage);
  const selectedFromParams =
    searchParams[slug]
      ?.split(",")
      .filter((val) => choices.some((choice) => choice.value === val)) ?? [];

  return (
    <MultiSelect
      name={slug}
      placeholder={filterName}
      options={choices}
      defaultValue={selectedFromParams}
    />
  );
};
