/**
 * Global declarations for the i18n package.
 * This file is used to declare the types for the i18n package.
 */

import type { SupportedLocale } from "./src/config";
/**
 * Import the messages from the default locale.
 * If the default locale is changed, adjust the import path.
 */
import type messages from "./src/messages/en-US.json";

/**
 * Export the message type from the default locale (en-US)
 * This allows other packages to use the strongly-typed message structure
 */
type Messages = typeof messages;

/**
 * Extend the next-intl AppConfig interface to include the Messages type from the default locale (en-US)
 * This allows other packages to use the strongly-typed message structure.
 */
declare module "next-intl" {
  interface AppConfig {
    // Formats: typeof formats;
    Locale: SupportedLocale;
    Messages: Messages;
  }
}
