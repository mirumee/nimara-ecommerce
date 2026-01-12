import type { AsyncResult } from "@nimara/domain/objects/Result";
import type { SupportedLocale } from "@nimara/foundation/regions/types";
import type { ServiceRegistry } from "@nimara/infrastructure/types";

/**
 * Type definition for the properties of the cart view and metadata, as it shares common parameters.
 * Every cart view should use this type to ensure consistency.
 * @property params - A promise that resolves to an object containing the locale.
 * @property searchParams - A promise that resolves to an object containing search parameters.
 */
export interface CartViewProps {
  accessToken: string | null;
  checkoutId: string | null;
  onCartUpdate: (cartId: string) => Promise<void>;
  onLineDelete: (params: {
    cartId: string;
    lineId: string;
  }) => AsyncResult<{ success: true }>;
  onLineQuantityChange: (params: {
    cartId: string;
    lineId: string;
    quantity: number;
  }) => AsyncResult<{ success: true }>;
  params: Promise<{ locale: SupportedLocale }>;
  paths: {
    checkout: string;
    checkoutSignIn: string;
    home: string;
  };
  searchParams: Promise<Record<string, string>>;
  services: ServiceRegistry;
}
