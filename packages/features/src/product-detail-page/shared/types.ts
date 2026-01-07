import { type AsyncResult } from "@nimara/domain/objects/Result";
import { Region, SupportedLocale } from "@nimara/foundation/regions/types.js";
import { ServiceRegistry } from "@nimara/infrastructure/types";

export type AddToBagAction = (params: {
  variantId: string;
  quantity?: number;
}) => AsyncResult<{ cartId: string }>;

/**
 * Type definition for the properties of the PDP view and metadata, as it shares common parameters.
 * Every PDP view should use this type to ensure consistency.
 * @property params - A promise that resolves to an object containing the locale and slug of the product.
 */
export interface PDPViewProps {
  params: Promise<{ locale: SupportedLocale; slug: string }>;
  services: ServiceRegistry;
  checkoutId: string | null;
  paths: {
    home: string;
    cart: string;
    search: (query: { category: string }) => string;
    product: (slug: string) => string;
  };
  addToBagAction: AddToBagAction;
}

export interface GenerateStandardPDPMetadataProps {
  params: Promise<{ locale: SupportedLocale; slug: string }>;
  services: ServiceRegistry;
  storefrontUrl: string;
  productPath: string;
}