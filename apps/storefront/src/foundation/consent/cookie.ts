import {
  CONSENT_VERSION,
  type ConsentCategories,
  type ConsentRecord,
} from "./types";

export const CONSENT_COOKIE_NAME = "cookie-consent";
export const CONSENT_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30 * 6; // 6 months

export const serializeConsent = (categories: ConsentCategories): string => {
  const record: ConsentRecord = {
    categories,
    version: CONSENT_VERSION,
  };

  return encodeURIComponent(JSON.stringify(record));
};

export const parseConsent = (raw: string | undefined): ConsentRecord | null => {
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(decodeURIComponent(raw)) as ConsentRecord;

    return parsed?.version === CONSENT_VERSION ? parsed : null;
  } catch {
    return null;
  }
};
