const LOCALE_DICTIONARY: Record<string, string> = {
  us: "",
  gb: "/gb",
};

// LOCALE - default to "us" if not provided
export const REQUESTED_LOCALE = process.env.LOCALE?.toLowerCase() || "us";

if (!Object.hasOwn(LOCALE_DICTIONARY, REQUESTED_LOCALE)) {
  throw new Error(
    `Unsupported LOCALE "${REQUESTED_LOCALE}". Use one of: ${Object.keys(LOCALE_DICTIONARY).join(", ")}`,
  );
}

// Sets prefix for URLs used in tests
export const LOCALE_PREFIX = LOCALE_DICTIONARY[REQUESTED_LOCALE];
