import { type NextMiddlewareResult } from "next/dist/server/web/types";
import {
  type NextFetchEvent,
  type NextRequest,
  type NextResponse,
} from "next/server";
import {
  type createTranslator,
  type MessageKeys,
  type Messages,
  type NamespaceKeys,
  type NestedKeyOf,
} from "next-intl";
/**
 * Helper type to filter keys that start with a given namespace.
 * @example
 * type Keys = KeysInNamespace<"home.title", "home">;
 * // => "title"
 */
type KeysInNamespace<
  AllKeys extends string,
  Namespace extends string,
> = Extract<AllKeys, `${Namespace}.${string}`>;

/**
 * Helper type to remove namespace prefix from keys.
 * @example
 * type Key = RemoveNamespacePrefix<"home.title", "home">;
 * // => "title"
 */
type RemoveNamespacePrefix<
  Key extends string,
  Namespace extends string,
> = Key extends `${Namespace}.${infer Rest}` ? Rest : never;

/**
 * Type for translation keys.
 * When used without a namespace, returns all message paths.
 * When used with a namespace (e.g., "home"), returns all message paths within that namespace (without the namespace prefix).
 * @example
 * type Path = MessagePath<"home">;
 * // => "title"
 * type Path = MessagePath<"account">;
 * // => "order-history" | "addresses" | "personal-data" | "privacy-settings" | "payment-methods"
 */
export type MessagePath<
  Namespace extends NamespaceKeys<Messages, NestedKeyOf<Messages>> | undefined =
    undefined,
> = Namespace extends undefined
  ? MessageKeys<Messages, NestedKeyOf<Messages>>
  : {
      [K in MessageKeys<
        Messages,
        KeysInNamespace<NestedKeyOf<Messages>, Namespace & string>
      >]: RemoveNamespacePrefix<K, Namespace & string>;
    }[MessageKeys<
      Messages,
      KeysInNamespace<NestedKeyOf<Messages>, Namespace & string>
    >];

/**
 * Translator function type.
 * @see https://next-intl.dev/docs/environments/core-library#non-react-apps
 */
export type GetTranslations<
  NestedKey extends NamespaceKeys<Messages, NestedKeyOf<Messages>> = never,
> = ReturnType<typeof createTranslator<Messages, NestedKey>>;

/**
 * List of all major currency codes defined by the ISO 4217 standard.
 * Feel free to add additional currencies as needed.
 * @see https://en.wikipedia.org/wiki/ISO_4217
 */
export type CurrencyCode =
  | "USD"
  | "GBP"
  | "EUR"
  | "AUD"
  | "CAD"
  | "CHF"
  | "JPY"
  | "PLN";

export interface I18nMiddlewareOptions {
  /**
   * Cookie key name for storing the checkout ID (optional).
   * If provided, the checkout ID cookie will be deleted when locale changes.
   * Default is "checkoutId".
   */
  checkoutIdCookieKey?: string;
  /**
   * Cookie key name for storing the locale.
   * Default is "NEXT_LOCALE".
   */
  localeCookieKey?: string;
  /**
   * Max age for the locale cookie in seconds.
   * Default is 360 days.
   */
  localeCookieMaxAge?: number;
  /**
   * Optional logger for debug and warning messages.
   */
  logger?: {
    debug: (message: string, meta?: Record<string, unknown>) => void;
    warning: (message: string) => void;
  };
  /**
   * Optional callback when locale changes.
   */
  onLocaleChange?: (from: string, to: string) => void;
}

export type CustomMiddleware = (
  request: NextRequest,
  event: NextFetchEvent,
  response: NextResponse,
) => NextMiddlewareResult | Promise<NextMiddlewareResult>;
