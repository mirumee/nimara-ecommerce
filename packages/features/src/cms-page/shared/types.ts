import type { SupportedLocale } from "@nimara/foundation/regions/types";
import type { ServiceRegistry } from "@nimara/infrastructure/types";

/**
 * Type definition for the properties of the CMS page view.
 * Every CMS page view should use this type to ensure consistency.
 * @property params - A promise that resolves to an object containing the locale and slug.
 */
export interface CMSPageViewProps {
    params: Promise<{ locale: SupportedLocale; slug: string }>;
    services: ServiceRegistry;
}

/**
 * Type definition for the properties of the CMS page metadata generation.
 * @property params - A promise that resolves to an object containing the locale and slug.
 * @property services - The service registry.
 */
export interface GenerateStandardCMSPageMetadataProps {
    params: Promise<{ locale: SupportedLocale; slug: string }>;
    services: ServiceRegistry;
}

