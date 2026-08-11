const LOCALE_DICTIONARY: Record<string, string> = {
  us: "/",
  gb: "/gb",
};

// Pobranie zmiennej środowiskowej LOCALE (domyślnie np. 'us')
export const REQUESTED_LOCALE = process.env.LOCALE?.toLowerCase() || "us";

// Wyciągnięcie odpowiedniego przedrostka URL
export const LOCALE_PREFIX =
  LOCALE_DICTIONARY[REQUESTED_LOCALE] || LOCALE_DICTIONARY["us"];
