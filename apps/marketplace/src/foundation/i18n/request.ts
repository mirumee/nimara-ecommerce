import { createRequestConfig } from "@nimara/i18n/request";

import { marketplaceLogger } from "@/services/logging";

export default createRequestConfig({
  app: "marketplace",
  logger: marketplaceLogger,
  onMissingTranslation: (locale) => {
    marketplaceLogger.warning(
      `Marketplace: Missing translation file for locale "${locale}"`,
    );
  },
  onCriticalError: (error) => {
    marketplaceLogger.error("Marketplace i18n critical error", { error });
  },
  onTranslationError: (error) => {
    marketplaceLogger.warning("Marketplace translation warning", {
      code: error.code,
      message: error.message,
    });
  },
});
