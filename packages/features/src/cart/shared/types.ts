import type { SupportedLocale } from "@nimara/foundation/regions/types";
import type { ServiceRegistry } from "@nimara/infrastructure/types";
import type { AsyncResult } from "@nimara/domain/objects/Result";

/**
 * Type definition for the properties of the cart view and metadata, as it shares common parameters.
 * Every cart view should use this type to ensure consistency.
 * @property params - A promise that resolves to an object containing the locale.
 * @property searchParams - A promise that resolves to an object containing search parameters.
 */
export interface CartViewProps {
    params: Promise<{ locale: SupportedLocale }>;
    searchParams: Promise<Record<string, string>>;
    services: ServiceRegistry;
    checkoutId: string | null;
    accessToken: string | null;
    onCartUpdate: (cartId: string) => Promise<void>;
    onLineQuantityChange: (params: {
        cartId: string;
        lineId: string;
        quantity: number;
    }) => AsyncResult<{ success: true }>;
    onLineDelete: (params: {
        cartId: string;
        lineId: string;
    }) => AsyncResult<{ success: true }>;
    paths: {
        home: string;
        checkout: string;
        checkoutSignIn: string;
    };
}

