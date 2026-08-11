const LOCALE_DICTIONARY: Record<string, string> = {
  us: "/",
  gb: "/gb",
};

// Pobranie zmiennej środowiskowej LOCALE (domyślnie np. 'us')
const requestedLocale = process.env.LOCALE?.toLowerCase() || "us";

// Wyciągnięcie odpowiedniego przedrostka URL
export const LOCALE_PREFIX =
  LOCALE_DICTIONARY[requestedLocale] || LOCALE_DICTIONARY["us"];
