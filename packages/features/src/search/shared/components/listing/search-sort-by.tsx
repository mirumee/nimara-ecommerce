"use client";

import type { SortByOption } from "@nimara/domain/objects/Search";
import { usePathname, useRouter } from "@nimara/i18n/routing";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@nimara/ui/components/select";

export const SearchSortBy = ({
  options,
  searchParams,
  defaultSortBy,
  sortByLabel,
  optionLabels,
}: {
  defaultSortBy: string;
  optionLabels: Record<string, string>;
  options: Array<SortByOption>;
  searchParams: Record<string, string>;
  sortByLabel: string;
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const selectedSortBy = searchParams["sortBy"] ?? defaultSortBy;

  const defaultValue = options.find(
    (option) => option.value === selectedSortBy,
  )?.value;

  const handleValueChange = (value: string) => {
    const params = new URLSearchParams(searchParams);

    // Clear the pagination
    params.delete("after");
    params.delete("before");
    params.delete("page");

    if (value === defaultSortBy) {
      params.delete("sortBy");
    } else {
      params.set("sortBy", value);
    }

    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium">{sortByLabel}</span>

      <div>
        <Select defaultValue={defaultValue} onValueChange={handleValueChange}>
          <SelectTrigger
            className="min-w-40 transition-colors"
            aria-label={sortByLabel}
          >
            <SelectValue placeholder={sortByLabel} />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {options.map(({ value, messageKey }) => (
                <SelectItem value={value} key={value}>
                  {optionLabels[value] ?? messageKey}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
