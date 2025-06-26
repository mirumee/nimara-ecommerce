"use client";

import { useTranslations } from "next-intl";

import type { SortByOption } from "@nimara/domain/objects/Search";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@nimara/ui/components/select";

import { DEFAULT_SORT_BY } from "@/config";
import { usePathname, useRouter } from "@/i18n/routing";
import type { TranslationMessage } from "@/types";

export const SearchSortBy = ({
  options,
  searchParams,
}: {
  options: Array<SortByOption>;
  searchParams: Record<string, string>;
}) => {
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  const defaultValue = options.find(
    (option) =>
      option.value === searchParams["sortBy"] ||
      option.value === DEFAULT_SORT_BY,
  )?.value;

  const handleValueChange = (value: string) => {
    const params = new URLSearchParams(searchParams);

    // Clear the pagination
    params.delete("after");
    params.delete("before");
    params.delete("page");

    if (value === DEFAULT_SORT_BY) {
      params.delete("sortBy");
    } else {
      params.set("sortBy", value);
    }

    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium">{t("search.sort-by")}</span>

      <div>
        <Select defaultValue={defaultValue} onValueChange={handleValueChange}>
          <SelectTrigger className="min-w-40" aria-label={t("search.sort-by")}>
            <SelectValue placeholder={t("search.sort-by")} />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {options.map(({ value, messageKey }) => (
                <SelectItem value={value} key={value}>
                  {t(messageKey as TranslationMessage)}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
