"use client";

import { Filter } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState, useTransition } from "react";

import { type SortByOption } from "@nimara/domain/objects/Search";
import { type MessagePath } from "@nimara/i18n/types";
import type {
  Facet,
  TaxonomyScope,
} from "@nimara/infrastructure/use-cases/search/types";
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
import { cn } from "@nimara/ui/lib/utils";

import {
  getFiltersFromSearchParams,
  processFormData,
} from "../../helpers/filters";
import { type GetFacetsAction } from "../../types";
import { FilterField } from "./filter-field";
import { FiltersCounter } from "./filters-counter";

type Props = {
  categoryScope?: TaxonomyScope;
  defaultSortBy: string;
  facets: Facet[];
  getFacets: GetFacetsAction;
  handleFiltersFormSubmit: (
    searchParams: Record<string, string>,
    formData: FormData,
  ) => Promise<never>;
  searchParams: Record<string, string>;
  sortByOptions: SortByOption[];
};

const serializeFilters = (filters: Record<string, string>) =>
  JSON.stringify(Object.entries(filters).sort());

export const FiltersContainer = ({
  facets: serverFacets,
  searchParams,
  sortByOptions,
  defaultSortBy,
  categoryScope,
  getFacets,
  handleFiltersFormSubmit: handleFiltersFormSubmitAction,
}: Props) => {
  const t = useTranslations();
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();

  const appliedFilters = getFiltersFromSearchParams(searchParams);
  const appliedKey = serializeFilters(appliedFilters);

  const [facets, setFacets] = useState(serverFacets);
  const [syncedKey, setSyncedKey] = useState(appliedKey);
  const fetchedForRef = useRef(appliedKey);
  const requestIdRef = useRef(0);
  /**
   * A dropdown reports its new value in the same event that settles it, so the
   * form's own inputs are still one render behind when the refresh fires.
   * These mirrored values are what the refresh trusts instead.
   */
  const dropdownValuesRef = useRef<Record<string, string>>({});

  /**
   * Every server action re-renders the route, so a new `facets` prop is not by
   * itself fresher than what this panel already fetched. Only the applied
   * filters changing makes the local set stale.
   */
  useEffect(() => {
    if (appliedKey !== syncedKey) {
      setSyncedKey(appliedKey);
      setFacets(serverFacets);
      fetchedForRef.current = appliedKey;
      dropdownValuesRef.current = {};
    }
  }, [appliedKey, syncedKey, serverFacets]);

  const refreshFacets = () => {
    if (!formRef.current) {
      return;
    }

    const filters = processFormData(new FormData(formRef.current)).toAdd;

    for (const [slug, value] of Object.entries(dropdownValuesRef.current)) {
      if (value) {
        filters[slug] = value;
      } else {
        delete filters[slug];
      }
    }

    const filtersKey = serializeFilters(filters);

    if (filtersKey === fetchedForRef.current) {
      return;
    }

    fetchedForRef.current = filtersKey;

    const requestId = ++requestIdRef.current;

    startTransition(async () => {
      const nextFacets = await getFacets({
        query: searchParams["q"] ?? "",
        filters,
        categoryScope,
      });

      if (requestId === requestIdRef.current) {
        setFacets(nextFacets);
      }
    });
  };

  const handleDropdownValueChange = (slug: string, value: string) => {
    dropdownValuesRef.current[slug] = value;
  };

  const filterFieldProps = {
    appliedFilters,
    pendingValues: dropdownValuesRef.current,
    onCommit: refreshFacets,
    onValueChange: handleDropdownValueChange,
  };

  const updateFiltersWithSearchParams = handleFiltersFormSubmitAction.bind(
    null,
    searchParams,
  );

  const booleanFacets = facets.filter((facet) => facet.type === "BOOLEAN");
  const swatchFacets = facets.filter((facet) => facet.type === "SWATCH");
  /**
   * A narrowed facet set can drop a filter that is still in the URL. Submitting
   * it as empty is what tells the form handler to remove it.
   */
  const droppedFilterSlugs = serverFacets
    .map(({ slug }) => slug)
    .filter(
      (slug) =>
        appliedFilters[slug] && !facets.some((facet) => facet.slug === slug),
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
          <span className="hidden md:block">{t("filters.filters")}</span>
          <FiltersCounter searchParams={searchParams} facets={facets} />
        </Button>
      </SheetTrigger>
      <SheetContent side="right-full">
        <form
          ref={formRef}
          action={updateFiltersWithSearchParams}
          className="flex h-full flex-col"
        >
          <SheetHeader>
            <SheetTitle>{t("filters.filters")}</SheetTitle>
          </SheetHeader>

          <SheetDescription asChild>
            <ScrollArea>
              <div
                aria-busy={isPending}
                className={cn(
                  "grid h-full gap-6 px-1 py-4 transition-opacity",
                  isPending && "pointer-events-none opacity-60",
                )}
              >
                <RadioGroup
                  name="sortBy"
                  className="grid gap-4 md:hidden"
                  defaultValue={searchParams["sortBy"] ?? defaultSortBy}
                >
                  <p className="text-primary text-base">
                    {t("search.sort-by")}
                  </p>
                  {sortByOptions.map((option) => (
                    <div key={option.value} className="flex gap-2">
                      <RadioGroupItem value={option.value} id={option.value} />
                      <Label htmlFor={option.value}>
                        {t(option.messageKey as MessagePath)}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>

                <div className="grid items-center gap-4">
                  {facets
                    ?.filter(({ type }) => type !== "BOOLEAN")
                    ?.filter(({ type }) => type !== "SWATCH")
                    .map((facet) => (
                      <FilterField
                        key={facet.slug}
                        facet={facet}
                        {...filterFieldProps}
                      />
                    ))}
                </div>

                {!!swatchFacets.length && (
                  <div>
                    <div className="grid items-center gap-4">
                      {swatchFacets.map((facet) => (
                        <FilterField
                          key={facet.slug}
                          facet={facet}
                          {...filterFieldProps}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {!!booleanFacets.length && (
                  <div>
                    <p className="dark:text-muted-foreground mb-4 text-base font-medium text-stone-700">
                      {t("filters.options")}
                    </p>
                    <div className="grid items-center gap-4">
                      {booleanFacets.map((facet) => (
                        <FilterField
                          key={facet.slug}
                          facet={facet}
                          {...filterFieldProps}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </SheetDescription>

          {droppedFilterSlugs.map((slug) => (
            <input key={slug} type="hidden" name={slug} value="" />
          ))}

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
