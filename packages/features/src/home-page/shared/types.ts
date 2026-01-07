import type { SupportedLocale } from "@nimara/foundation/regions/types";
import type { ServiceRegistry } from "@nimara/infrastructure/types";

/**
 * Type definition for the properties of the home page view.
 * Every home page view should use this type to ensure consistency.
 * @property params - A promise that resolves to an object containing the locale.
 * @property searchParams - A promise that resolves to an object containing search parameters.
 */
export interface HomeViewProps {
    params: Promise<{ locale: SupportedLocale }>;
    searchParams: Promise<Record<string, string>>;
    services: ServiceRegistry;
    accessToken: string | null;
    paths: {
        search: string;
        product: (slug: string) => string;
    };
}

/**
 * Type definition for the properties of the home page metadata generation.
 * @property params - A promise that resolves to an object containing the locale.
 * @property storefrontUrl - The base URL of the storefront.
 */
export interface GenerateStandardHomeMetadataProps {
    params: Promise<{ locale: SupportedLocale }>;
    storefrontUrl: string;
}

