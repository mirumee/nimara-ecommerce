import { Filter } from "lucide-react";
import { getTranslations } from "next-intl/server";

import type { SortByOption } from "@nimara/domain/objects/Search";
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
import { FilterText } from "./filter-text";

type Props = {
  facets: Facet[];
  searchParams: Record<string, string>;
  sortByOptions: SortByOption[];
};

const renderFilterComponent = (
  facet: Facet,
  searchParams: Record<string, string>,
) => {
  // TODO: Extend this function for other, more adequate Filter components
  switch (facet.type) {
    case "PLAIN_TEXT":
      return (
        <FilterText
          key={facet.name}
          facet={facet}
          searchParams={searchParams}
        />
      );
    case "SWATCH":
      return (
        <ColorSwatch
          key={facet.name}
          facet={facet}
          searchParams={searchParams}
        />
      );
    case "MULTISELECT":
    case "DROPDOWN":
      return (
        <FilterDropdown
          key={facet.name}
          facet={facet}
          searchParams={searchParams}
        />
      );
    case "BOOLEAN":
      return (
        <FilterBoolean
          key={facet.name}
          facet={facet}
          searchParams={searchParams}
        />
      );
  }
};

const colors = [
  "yellow",
  "black",
  "white",
  "beige",
  "grey",
  "khaki",
  "pink",
  "red",
  "green",
] as const;

export type ColorValue = (typeof colors)[number];

export const FiltersContainer = async ({
  facets,
  searchParams,
  sortByOptions,
}: Props) => {
  const t = await getTranslations();
  const genderFacet = facets.filter((facet) => facet.slug === "gender");
  const sizeFacet = facets.filter((facet) => facet.slug === "size");
  const colorFacet = facets
    .filter((facet) => facet.slug === "color")
    .map((facet) => ({
      ...facet,
      choices: colors.map((color) => ({
        label: t(`colors.${color}`),
        value: color as string,
      })),
    }));

  const updateFiltersWithSearchParams = handleFiltersFormSubmit.bind(
    null,
    searchParams,
  );

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          className="flex gap-2"
          aria-label={t("filters.filters")}
        >
          <Filter className="h-4 w-4" />
          <label className="hidden md:block">{t("filters.filters")}</label>
        </Button>
      </SheetTrigger>
      <SheetContent side="right-full">
        <form
          action={updateFiltersWithSearchParams}
          className="flex h-full flex-col"
          id="filters-form"
        >
          <SheetHeader>
            <SheetTitle className="text-stone-700">
              {t("filters.filters")}
            </SheetTitle>
          </SheetHeader>

          <SheetDescription asChild>
            <ScrollArea>
              <div className="grid h-full gap-4 py-4">
                <RadioGroup
                  name="sortBy"
                  className="grid gap-4 md:hidden"
                  defaultValue={searchParams["sortBy"] ?? DEFAULT_SORT_BY}
                >
                  <p className="text-base text-black">{t("search.sort-by")}</p>
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
                  {genderFacet.map((facet) =>
                    renderFilterComponent(facet, searchParams),
                  )}
                </div>
                <div className="grid items-center gap-4">
                  {sizeFacet.map((facet) =>
                    renderFilterComponent(facet, searchParams),
                  )}
                </div>
                <div className="grid items-center gap-4">
                  {colorFacet.map((facet) =>
                    renderFilterComponent(facet, searchParams),
                  )}
                </div>
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
