import type { SupportedLocale } from "@nimara/foundation/regions/types";
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
    services: ServiceRegistry;
    paths: {
        home: string;
        collection: (slug: string) => string;
        product: (slug: string) => string;
    };
    localePrefixes: Record<Exclude<SupportedLocale, "en-US">, string>;
    defaultLocale: SupportedLocale;
    defaultResultsPerPage: number;
}

/**
 * Type definition for the properties of the collection metadata generation.
 * @property params - A promise that resolves to an object containing the locale and slug.
 * @property services - The service registry.
 * @property storefrontUrl - The base URL of the storefront.
 * @property collectionPath - The path to the collection page.
 * @property defaultResultsPerPage - The default number of results per page.
 */
export interface GenerateStandardCollectionMetadataProps {
    params: Promise<{ locale: SupportedLocale; slug: string }>;
    services: ServiceRegistry;
    storefrontUrl: string;
    collectionPath: string;
    defaultResultsPerPage: number;
}

