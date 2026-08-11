const LOCALE_DICTIONARY: Record<string, string> = {
  us: "",
  gb: "/gb",
};

// LOCALE - default to "us" if not provided
export const REQUESTED_LOCALE = process.env.LOCALE?.toLowerCase() || "us";

// Sets prefix for URLs used in tests
export const LOCALE_PREFIX =
  LOCALE_DICTIONARY[REQUESTED_LOCALE] || LOCALE_DICTIONARY["us"];
