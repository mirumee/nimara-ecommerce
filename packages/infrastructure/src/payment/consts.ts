export enum QUERY_PARAMS {
  SAVE_FOR_FUTURE_USE = "saveForFutureUse",
  SETUP_INTENT = "setup_intent",
  TRANSACTION_ID = "transactionId",
}

export enum META_KEY {
  ENVIRONMENT = "ENVIRONMENT",
  SALEOR_ID = "SALEOR_ID",
}

export const API_VERSION = "2025-12-15.clover";

export const PAYMENT_USAGE: "off_session" | "on_session" = "on_session";

export const PAYMENT_REDIRECT: "always" | "if_required" = "always";
