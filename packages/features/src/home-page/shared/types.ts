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
}

/**
 * Type definition for the properties of the standard home page view.
 * @property params - A promise that resolves to an object containing the locale.
 * @property storefrontUrl - The base URL of the storefront.
 * @property accessToken - The access token for authenticated requests, or null if not authenticated.
 * @property services - The service registry containing all necessary services.
 * @property paths - An object containing functions to generate paths for products and search.
 */
export interface StandardHomeViewProps extends HomeViewProps {
  accessToken: string | null;
  paths: {
    product: (slug: string) => string;
    search: string;
  };
  services: ServiceRegistry;
  storefrontUrl: string;
}
