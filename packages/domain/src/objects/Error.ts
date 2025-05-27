/**
 * @type ErrorCodeFormat
 * @description Error codes are used to represent different types of errors in the system.
 **/
type ErrorCodeFormat = `${string}_ERROR`;

/**
 * @description Error code related to unknown errors.
 */
export type UnknownErrorCode = "UNKNOWN_ERROR";

/**
 * @description Error codes related to HTTP errors.
 */
export const HTTP_ERROR_CODES = [
  "HTTP_ERROR",
  "NOT_FOUND_ERROR",
  "TOO_MANY_REQUESTS_ERROR",
  "BAD_REQUEST_ERROR",
  "UNEXPECTED_HTTP_ERROR",
] as const satisfies ErrorCodeFormat[];
export type HTTPErrorCode = (typeof HTTP_ERROR_CODES)[number];

/**
 * @description Error codes related to authentication and authorization.
 */
export const AUTH_ERROR_CODES = [
  "ACCOUNT_CONFIRM_ERROR",
  "ACCOUNT_REGISTER_ERROR",
  "PASSWORD_CHANGE_ERROR",
  "PASSWORD_CHANGE_REQUEST_ERROR",
  "PASSWORD_SET_ERROR",
  "TOKEN_REFRESH_ERROR",
] as const satisfies ErrorCodeFormat[];
export type AuthErrorCode = (typeof AUTH_ERROR_CODES)[number];

/**
 * @description Error codes related to customer account and its actions.
 */
export const ACCOUNT_ERROR_CODES = [
  "ACCESS_TOKEN_NOT_FOUND_ERROR",
  "ACCOUNT_CREATE_ERROR",
  "ACCOUNT_DELETE_ERROR",
  "ACCOUNT_REQUEST_DELETION_ERROR",
  "ACCOUNT_UPDATE_ERROR",
  "EMAIL_CHANGE_CONFIRMATION_ERROR",
  "EMAIL_CHANGE_REQUEST_ERROR",
] as const satisfies ErrorCodeFormat[];
export type AccountErrorCode = (typeof ACCOUNT_ERROR_CODES)[number];

/**
 * @description Error codes related to address actions.
 */
export const ADDRESS_ERROR_CODES = [
  "ADDRESS_CREATE_ERROR",
  "ADDRESS_DELETE_ERROR",
  "ADDRESS_SET_DEFAULT_ERROR",
  "ADDRESS_UPDATE_ERROR",
  "COUNTRIES_NOT_FOUND_ERROR",
  "MISSING_ADDRESS_DATA_ERROR",
  "JWT_INVALID_TOKEN_ERROR",
  "JWT_SIGNATURE_EXPIRED_ERROR",
  "UNIQUE_ERROR",
] as const satisfies ErrorCodeFormat[];
export type AddressErrorCode = (typeof ADDRESS_ERROR_CODES)[number];

/**
 * @description Error codes related to cart/checkout actions.
 */
export const CHECKOUT_ERROR_CODES = [
  "CART_CREATE_ERROR",
  "CART_LINES_ADD_ERROR",
  "CART_LINES_DELETE_ERROR",
  "CART_LINES_UPDATE_ERROR",
  "CART_NOT_FOUND_ERROR",
  "CHECKOUT_BILLING_ADDRESS_UPDATE_ERROR",
  "CHECKOUT_COMPLETE_ERROR",
  "CHECKOUT_CUSTOMER_ATTACH_ERROR",
  "CHECKOUT_DELIVERY_METHOD_UPDATE_ERROR",
  "CHECKOUT_EMAIL_UPDATE_ERROR",
  "CHECKOUT_GATEWAY_CUSTOMER_GET_ERROR",
  "CHECKOUT_NOT_FOUND_ERROR",
  "CHECKOUT_NOT_PAID_ERROR",
  "CHECKOUT_SHIPPING_ADDRESS_UPDATE_ERROR",
  "CREATE_SETUP_INTENT_ERROR",
  "CUSTOMER_NOT_FOUND_ERROR",
  "DISCOUNT_CODE_ADD_ERROR",
  "DISCOUNT_CODE_REMOVE_ERROR",
  "GENERIC_CARD_ERROR",
  "GENERIC_PAYMENT_ERROR",
  "NOT_AVAILABLE_ERROR",
  "PAYMENT_EXECUTE_ERROR",
  "PAYMENT_GATEWAY_INITIALIZE_ERROR",
  "PAYMENT_METHOD_NOT_FOUND_ERROR",
  "PAYMENT_METHOD_SAVE_ERROR",
  "PAYMENT_PROCESSING_ERROR",
  "TRANSACTION_INITIALIZE_ERROR",
  "TRANSACTION_PROCESS_ERROR",
  "VOUCHER_NOT_APPLICABLE_ERROR",
] as const satisfies ErrorCodeFormat[];
export type CheckoutErrorCode = (typeof CHECKOUT_ERROR_CODES)[number];

/**
 * @type GenericErrorCode
 * @description Union type of all error codes.
 */
export type GenericErrorCode =
  | AccountErrorCode
  | AddressErrorCode
  | AuthErrorCode
  | CheckoutErrorCode
  | HTTPErrorCode;

const VALIDATION_ERROR_CODES = [
  "INVALID_VALUE_ERROR",
  "REQUIRED_ERROR",
  "INSUFFICIENT_STOCK_ERROR",
] as const satisfies ErrorCodeFormat[];

export type ValidationErrorCode = (typeof VALIDATION_ERROR_CODES)[number];

export type AppErrorCode =
  | UnknownErrorCode
  | GenericErrorCode
  | ValidationErrorCode;

/**
 * @type BaseError
 * @description Base error type. This type is used to represent errors in the system.
 * It contains a code and an optional message. The code is used as a key in translation.
 * The message is optional and can be used as a fallback message on the frontend.
 * Always prefer translating using the code.
 * @property {ErrorCode} code - Error code. This code must be used as a key in translation.
 * @property {number} [status] - HTTP status code. This is optional and can be used to represent the HTTP status of the error.
 * @property {string} [field] - This field is optional and can be used to represent the form field that errored.
 * @property {string} [message] - This message is just for developers, eventually can be used as a fallback message on the frontend. Always prefer translating using the code.
 * @property {unknown} [context] - This field is optional and can be used to represent the context of the error.
 * @example
 * const error = {
 *   code: "INPUT_ERROR",
 *   message: "Invalid input",
 *   status: 400,
 *   context: { email: "Invalid email format" },
 * } satisfies BaseError<"INPUT_ERROR">
 **/
export type BaseError<C extends AppErrorCode = AppErrorCode> = {
  /*
   * Error code. This code must be used as a key in translation.
   */
  code: C;
  /*
   * This field is optional and can be used to represent the context of the error.
   */
  context?: Record<string, unknown>;
  /*
   * This field is optional and can be used to represent the form field that errored.
   */
  field?: string;
  /*
   * This message is just for developers, eventually can be used as a fallback message on the frontend. Always prefer translating using the code.
   */
  message?: string;
  /*
   * This field is optional and can be used to save the original error.
   */
  originalError?: unknown;
  /*
   * HTTP status code. This is optional and can be used to represent the HTTP status of the error.
   */
  status?: number;
};

/**
 * @type GenericApiError
 * @description Generic API error.
 */
export type GenericApiError = BaseError<AppErrorCode>;

/**
 * @type BaseError
 * @description App error. This type is used to represent all possible errors in the system.
 */
export type AppError = GenericApiError;
