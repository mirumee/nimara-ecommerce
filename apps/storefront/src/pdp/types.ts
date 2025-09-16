import { type SupportedLocale } from "@/regions/types";

/**
 * Type definition for the properties of the PDP view and metadata, as it shares common parameters.
 * Every PDP view should use this type to ensure consistency.
 * @property params - A promise that resolves to an object containing the locale and slug of the product.
 */
export interface PDPViewProps {
  params: Promise<{ locale: SupportedLocale; slug: string }>;
}
