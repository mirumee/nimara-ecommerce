import { type LocalePrefixes, type SupportedLocale } from "@nimara/i18n/config";
import type { ServiceRegistry } from "@nimara/infrastructure/types";

/**
 * Type definition for the properties of the collection view.
 * Every collection view should use this type to ensure consistency.
 * @property params - A promise that resolves to an object containing the locale and slug.
 * @property searchParams - A promise that resolves to an object containing search parameters.
 */
export interface CollectionViewProps {
  params: Promise<{ locale: SupportedLocale; slug: string }>;
  searchParams: Promise<{
    after?: string;
    before?: string;
    limit?: string;
  }>;
}

/**
 * Enhanced type definition for the properties of the standard collection view.
 * Extends the base CollectionViewProps with additional properties specific to the standard view.
 * @property defaultLocale - The default locale for the collection view.
 * @property defaultResultsPerPage - The default number of results to display per page.
 * @property paths - An object containing functions to generate paths for collection, home, and product pages.
 * @property localePrefixes - A record mapping supported locales (excluding "en-US") to their respective URL prefixes.
 * @property services - The service registry containing all necessary services for the collection view.
 */
export interface StandardCollectionViewProps extends CollectionViewProps {
  defaultLocale: SupportedLocale;
  defaultResultsPerPage: number;
  localePrefixes: LocalePrefixes;
  paths: {
    collection: (slug: string) => string;
    home: string;
    product: (slug: string) => string;
  };
  services: ServiceRegistry;
}

/**
 * Type definition for the properties of the collection metadata generation.
 * @property params - A promise that resolves to an object containing the locale and slug.
 * @property services - The service registry.
 * @property storefrontUrl - The base URL of the storefront.
 * @property collectionPath - The path to the collection page.
 * @property defaultResultsPerPage - The default number of results per page.
 */
export interface StandardCollectionViewMetadataProps extends CollectionViewProps {
  collectionPath: string;
  defaultResultsPerPage: number;
  services: ServiceRegistry;
  storefrontUrl: string;
}
