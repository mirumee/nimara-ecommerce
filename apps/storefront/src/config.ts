import { type ThumbnailFormatEnum } from "@nimara/codegen/schema";

// Saleor config
export const IMAGE_FORMAT: ThumbnailFormatEnum = "AVIF";
export const IMAGE_SIZES = {
  pdp: 1024,
};

const MINUTE = 60;
const HOUR = MINUTE * 60;
const DAY = HOUR * 24;

export const CACHE_TTL = {
  pdp: DAY,
  cart: MINUTE * 5,
  cms: MINUTE * 15,
};
export const DEFAULT_DEBOUNCE_TIME_IN_MS = 500;
export const DEFAULT_SORT_BY = "price-asc";
export const DEFAULT_RESULTS_PER_PAGE = 16;

export const COOKIE_KEY = {
  checkoutId: "checkoutId",
  accessToken: "accessToken",
  refreshToken: "refreshToken",
  searchProvider: "searchProvider",
};

export const COOKIE_MAX_AGE = {
  checkout: 30 * DAY,
};

export const MIN_PASSWORD_LENGTH = 8;

export const DEFAULT_PAGE_TITLE = "Nimara Storefront";

export const CHANGE_EMAIL_TOKEN_VALIDITY_IN_HOURS = 72;
