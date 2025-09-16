import { Filter } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { type SortByOption } from "@nimara/domain/objects/Search";
import type { Facet } from "@nimara/infrastructure/use-cases/search/types";
import { Button } from "@nimara/ui/components/button";
import { Label } from "@nimara/ui/components/label";
import { RadioGroup, RadioGroupItem } from "@nimara/ui/components/radio-group";
import { ScrollArea } from "@nimara/ui/components/scroll-area";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@nimara/ui/components/sheet";

import { DEFAULT_SORT_BY } from "@/config";
import { type TranslationMessage } from "@/types";

import { handleFiltersFormSubmit } from "../actions";
import { ColorSwatch } from "./color-swatch";
import { FilterBoolean } from "./filter-boolean";
import { FilterDropdown } from "./filter-dropdown";
import { FilterMultiSelect } from "./filter-multi-select";
import { FilterText } from "./filter-text";
import { FiltersCounter } from "./filters-counter";

type Props = {
  facets: Facet[];
  searchParams: Record<string, string>;
  sortByOptions: SortByOption[];
};

const renderFilterComponent = (
  facet: Facet,
  searchParams: Record<string, string>,
) => {
  switch (facet.type) {
    case "BOOLEAN":
      return (
        <FilterBoolean
          key={facet.slug}
          facet={facet}
          searchParams={searchParams}
        />
      );
    case "DROPDOWN":
      return (
        <FilterDropdown
          key={facet.slug}
          facet={facet}
          searchParams={searchParams}
        />
      );
    case "MULTISELECT":
      return (
        <FilterMultiSelect
          key={facet.slug}
          facet={facet}
          searchParams={searchParams}
        />
      );
    case "PLAIN_TEXT":
      return (
        <FilterText
          key={facet.slug}
          facet={facet}
          searchParams={searchParams}
        />
      );
    case "SWATCH":
      return (
        <ColorSwatch
          key={facet.slug}
          facet={facet}
          searchParams={searchParams}
        />
      );
  }
};

export const FiltersContainer = async ({
  facets,
  searchParams,
  sortByOptions,
}: Props) => {
  const t = await getTranslations();

  const updateFiltersWithSearchParams = handleFiltersFormSubmit.bind(
    null,
    searchParams,
  );

  const booleanFacets = facets.filter((facet) => facet.type === "BOOLEAN");
  const swatchFacets = facets.filter((facet) => facet.type === "SWATCH");

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          className="flex gap-2"
          aria-label={t("filters.filters")}
        >
          <Filter className="h-4 w-4" />
          <span className="hidden md:block">{t("filters.filters")}</span>
          <FiltersCounter searchParams={searchParams} facets={facets} />
        </Button>
      </SheetTrigger>
      <SheetContent side="right-full">
        <form
          action={updateFiltersWithSearchParams}
          className="flex h-full flex-col"
        >
          <SheetHeader>
            <SheetTitle>{t("filters.filters")}</SheetTitle>
          </SheetHeader>

          <SheetDescription asChild>
            <ScrollArea>
              <div className="grid h-full gap-6 px-1 py-4">
                <RadioGroup
                  name="sortBy"
                  className="grid gap-4 md:hidden"
                  defaultValue={searchParams["sortBy"] ?? DEFAULT_SORT_BY}
                >
                  <p className="text-primary text-base">
                    {t("search.sort-by")}
                  </p>
                  {sortByOptions.map((option) => (
                    <div key={option.value} className="flex gap-2">
                      <RadioGroupItem value={option.value} id={option.value} />
                      <Label htmlFor={option.value}>
                        {t(option.messageKey as TranslationMessage)}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>

                <div className="grid items-center gap-4">
                  {facets
                    ?.filter(({ type }) => type !== "BOOLEAN")
                    ?.filter(({ type }) => type !== "SWATCH")
                    .map((facet) => renderFilterComponent(facet, searchParams))}
                </div>

                {!!swatchFacets.length && (
                  <div>
                    <div className="grid items-center gap-4">
                      {swatchFacets.map((facet) =>
                        renderFilterComponent(facet, searchParams),
                      )}
                    </div>
                  </div>
                )}

                {!!booleanFacets.length && (
                  <div>
                    <p className="dark:text-muted-foreground mb-4 text-base font-medium text-stone-700">
                      {t("filters.options")}
                    </p>
                    <div className="grid items-center gap-4">
                      {booleanFacets.map((facet) =>
                        renderFilterComponent(facet, searchParams),
                      )}
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </SheetDescription>

          <SheetFooter className="mt-auto">
            <SheetClose asChild>
              <div className="grid w-full grid-cols-2 justify-between gap-4">
                <Button type="submit" variant="outline" name="clear">
                  {t("filters.clear")}
                </Button>
                <Button type="submit">{t("filters.show-products")}</Button>
              </div>
            </SheetClose>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
};
