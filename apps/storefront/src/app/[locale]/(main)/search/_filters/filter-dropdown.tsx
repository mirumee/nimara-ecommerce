import { getTranslations } from "next-intl/server";

import type { Facet } from "@nimara/infrastructure/use-cases/search/types";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@nimara/ui/components/select";

import type { TranslationMessage } from "@/types";

export const FilterDropdown = async ({
  facet: { name, choices, slug, messageKey },
  searchParams,
}: {
  facet: Facet;
  searchParams: Record<string, string>;
}) => {
  const t = await getTranslations();
  const filterName = name ?? t(messageKey as TranslationMessage);
  const defaultValue = choices?.find(
    ({ value }) => value === searchParams[slug],
  )?.value;

  return (
    <Select defaultValue={defaultValue} name={slug}>
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
