import type { Locale } from "next-intl";

import type { SearchParams } from "@nimara/features/search/shared/types";
import { type Region } from "@nimara/foundation/regions/types";
import type { LocalePrefixes } from "@nimara/i18n/config";
import type { ServiceRegistry } from "@nimara/infrastructure/types";

/**
 * Type definition for the properties of the category view.
 * Every category view should use this type to ensure consistency.
 * @property params - A promise that resolves to an object containing the locale and slug.
 * @property searchParams - A promise that resolves to an object containing search parameters.
 */
export interface CategoryViewProps {
  params: Promise<{ locale: Locale; slug: string }>;
  searchParams: Promise<SearchParams>;
}

/**
 * Enhanced type definition for the properties of the standard category view.
 * Extends the base CategoryViewProps with additional properties specific to the standard view.
 */
export interface StandardCategoryViewProps extends CategoryViewProps {
  defaultLocale: Locale;
  defaultResultsPerPage: number;
  defaultSortBy: string;
  handleFiltersFormSubmit: (
    searchParams: Record<string, string>,
    formData: FormData,
  ) => Promise<never>;
  localePrefixes: LocalePrefixes;
  paths: {
    category: (slug: string) => string;
    home: string;
    product: (slug: string) => string;
  };
  region: Region;
  services: ServiceRegistry;
}

/**
 * Type definition for the properties of the category metadata generation.
 */
export interface StandardCategoryViewMetadataProps extends CategoryViewProps {
  categoryPath: string;
  services: ServiceRegistry;
  storefrontUrl: string;
}
