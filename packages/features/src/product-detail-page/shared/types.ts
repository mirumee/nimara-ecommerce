import { type AsyncResult } from "@nimara/domain/objects/Result";
import { type SupportedLocale } from "@nimara/foundation/regions/types.js";
import { type ServiceRegistry } from "@nimara/infrastructure/types";

export type AddToBagAction = (params: {
  quantity?: number;
  variantId: string;
}) => AsyncResult<{ cartId: string }>;

/**
 * Type definition for the properties of the PDP view and metadata, as it shares common parameters.
 * Every PDP view should use this type to ensure consistency.
 * @property params - A promise that resolves to an object containing the locale and slug of the product.
 */
export interface PDPViewProps {
  addToBagAction: AddToBagAction;
  checkoutId: string | null;
  params: Promise<{ locale: SupportedLocale; slug: string }>;
  paths: {
    cart: string;
    home: string;
    product: (slug: string) => string;
    search: (query: { category: string }) => string;
  };
  services: ServiceRegistry;
}

export interface GenerateStandardPDPMetadataProps {
  params: Promise<{ locale: SupportedLocale; slug: string }>;
  productPath: string;
  services: ServiceRegistry;
  storefrontUrl: string;
}
