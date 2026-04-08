import { type BaseError } from "@nimara/domain/objects/Error";

/**
 * Maps domain error codes to HTTP status codes.
 * Used to provide appropriate HTTP responses for API errors.
 *
 * Reference: https://ucp.dev/2026-01-23/specification/checkout/
 */
const ERROR_CODE_TO_STATUS_MAP: Record<string, number> = {
  // Not Found (404)
  CHECKOUT_NOT_FOUND_ERROR: 404,
  CART_NOT_FOUND_ERROR: 404,
  PAYMENT_METHOD_NOT_FOUND_ERROR: 404,
  CUSTOMER_NOT_FOUND_ERROR: 404,

  // Bad Request (400)
  BAD_REQUEST_ERROR: 400,
  CART_CREATE_ERROR: 400,
  CART_LINES_UPDATE_ERROR: 400,
  CART_LINES_ADD_ERROR: 400,
  CART_LINES_DELETE_ERROR: 400,
  CHECKOUT_COMPLETE_ERROR: 400,
  CHECKOUT_EMAIL_UPDATE_ERROR: 400,
  CHECKOUT_SHIPPING_ADDRESS_UPDATE_ERROR: 400,
  CHECKOUT_BILLING_ADDRESS_UPDATE_ERROR: 400,
  CHECKOUT_DELIVERY_METHOD_UPDATE_ERROR: 400,
  INVALID_VALUE_ERROR: 400,
  REQUIRED_ERROR: 400,
  INSUFFICIENT_STOCK_ERROR: 400,

  // Conflict (409) - for idempotency violations
  UNIQUE_ERROR: 409,

  // Too Many Requests (429)
  TOO_MANY_REQUESTS_ERROR: 429,

  // Unauthorized (401)
  ACCOUNT_CONFIRM_ERROR: 401,
  TOKEN_REFRESH_ERROR: 401,

  // Forbidden (403)
  ACCESS_TOKEN_NOT_FOUND_ERROR: 403,

  // Default: Internal Server Error (500)
};

/**
 * Determines the appropriate HTTP status code for an API error.
 *
 * @param error - Domain error object
 * @returns HTTP status code (default 500)
 *
 * @example
 * const status = getHttpStatusFromError(error);
 * // Returns 404 for CHECKOUT_NOT_FOUND_ERROR
 * // Returns 400 for CART_CREATE_ERROR
 * // Returns 500 for unknown errors
 */
export function getHttpStatusFromError(error: BaseError): number {
  return ERROR_CODE_TO_STATUS_MAP[error.code] ?? 500;
}

/**
 * Determines HTTP status from the first error in an array.
 * Useful for batch error responses where the first error determines the status.
 *
 * @param errors - Array of domain errors
 * @returns HTTP status code (default 500 if empty)
 */
export function getHttpStatusFromErrors(errors: BaseError[]): number {
  if (!errors || errors.length === 0) {
    return 500;
  }

  return getHttpStatusFromError(errors[0]);
}
