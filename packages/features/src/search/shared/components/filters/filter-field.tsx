"use client";

import type { Facet } from "@nimara/infrastructure/use-cases/search/types";

import { ColorSwatch } from "./color-swatch";
import { FilterBoolean } from "./filter-boolean";
import { FilterDropdown } from "./filter-dropdown";
import { FilterMultiSelect } from "./filter-multi-select";
import { FilterText } from "./filter-text";

type Props = {
  appliedFilters: Record<string, string>;
  facet: Facet;
  onCommit: () => void;
  onValueChange: (slug: string, value: string) => void;
  /**
   * Selections the URL has not caught up with yet, so a dropdown keeps showing
   * what the user just picked while the facets are being re-read.
   */
  pendingValues: Record<string, string>;
};

export const FilterField = ({
  facet,
  appliedFilters,
  pendingValues,
  onCommit,
  onValueChange,
}: Props) => {
  const value = appliedFilters[facet.slug];
  const pendingValue = pendingValues[facet.slug] ?? value;

  switch (facet.type) {
    case "BOOLEAN":
      return <FilterBoolean facet={facet} value={value} />;
    case "DROPDOWN":
      return (
        <FilterDropdown
          facet={facet}
          value={pendingValue}
          onCommit={onCommit}
          onValueChange={onValueChange}
        />
      );
    case "MULTISELECT":
      return (
        <FilterMultiSelect
          facet={facet}
          value={pendingValue}
          onCommit={onCommit}
          onValueChange={onValueChange}
        />
      );
    case "PLAIN_TEXT":
      return <FilterText facet={facet} value={value} />;
    case "SWATCH":
      return <ColorSwatch facet={facet} value={value} />;
  }
};
