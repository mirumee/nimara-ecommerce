import type { SupportedLocale } from "@nimara/foundation/regions/types";
import type { ServiceRegistry } from "@nimara/infrastructure/types";

/**
 * Type definition for the search parameters accepted by the search view.
 */
export type SearchParams = {
  [key: string]: string | undefined;
  after?: string;
  before?: string;
  category?: string;
  collection?: string;
  limit?: string;
  page?: string;
  q?: string;
  sortBy?: string;
};

/**
 * Type definition for the properties of the search view.
 * Every search view should use this type to ensure consistency.
 * @property params - A promise that resolves to an object containing the locale.
 * @property searchParams - A promise that resolves to an object containing search parameters.
 */
export interface SearchViewProps {
  defaultLocale: SupportedLocale;
  defaultResultsPerPage: number;
  defaultSortBy: string;
  handleFiltersFormSubmit: (
    searchParams: Record<string, string>,
    formData: FormData,
  ) => Promise<never>;
  localePrefixes: Record<Exclude<SupportedLocale, "en-US">, string>;
  params: Promise<{ locale: SupportedLocale }>;
  paths: {
    home: string;
    product: (slug: string) => string;
    search: string;
  };
  searchParams: Promise<SearchParams>;
  services: ServiceRegistry;
}

/**
 * Type definition for the properties of the search metadata generation.
 * @property params - A promise that resolves to an object containing the locale.
 * @property searchParams - A promise that resolves to an object containing search parameters.
 * @property services - The service registry.
 * @property storefrontUrl - The base URL of the storefront.
 * @property searchPath - The path to the search page.
 */
export interface GenerateStandardSearchMetadataProps {
  params: Promise<{ locale: SupportedLocale }>;
  searchParams: Promise<SearchParams>;
  searchPath: string;
  services: ServiceRegistry;
  storefrontUrl: string;
}
