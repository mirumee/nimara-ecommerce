// TODO: Remove this in favor of BaseError
export type AccountError = {
  code: string;
  field: string | null;
  message: string | null;
};

/*
 * @type Code
 * @description Error codes are used to represent different types of errors in the system.
 */
type ErrorCodeFormat = `${string}_ERROR`;

/**
 * @description Error codes related to HTTP errors.
 */
export const HTTP_ERROR_CODES = [
  "HTTP_ERROR",
  "NOT_FOUND_ERROR",
  "TOO_MANY_REQUESTS_ERROR",
  "UNEXPECTED_HTTP_ERROR",
] as const satisfies ErrorCodeFormat[];
export type HTTPErrorCode = (typeof HTTP_ERROR_CODES)[number];

/**
 * @description Error codes related to authentication and authorization.
 */
export const AUTH_ERROR_CODES = [
  "ACCOUNT_REGISTER_ERROR",
  "ACCOUNT_CONFIRM_ERROR",
  "TOKEN_REFRESH_ERROR",
  "PASSWORD_SET_ERROR",
  "PASSWORD_CHANGE_ERROR",
  "PASSWORD_CHANGE_REQUEST_ERROR",
] as const satisfies ErrorCodeFormat[];
export type AuthErrorCode = (typeof AUTH_ERROR_CODES)[number];

/**
 * @description Error codes related to customer account and its actions.
 */
export const ACCOUNT_ERROR_CODES = [
  "ACCESS_TOKEN_NOT_FOUND_ERROR",
  "ACCOUNT_CREATE_ERROR",
  "ACCOUNT_DELETE_ERROR",
  "ACCOUNT_UPDATE_ERROR",
  "ACCOUNT_REQUEST_DELETION_ERROR",
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
  "ADDRESS_UPDATE_ERROR",
  "ADDRESS_SET_DEFAULT_ERROR",
  "MISSING_ADDRESS_DATA_ERROR",
  "COUNTRIES_NOT_FOUND_ERROR",
] as const;
export type AddressErrorCode = (typeof ADDRESS_ERROR_CODES)[number];

/**
 * @description Error codes related to checkout actions.
 */
export const CHECKOUT_ERROR_CODES = [
  "CART_NOT_FOUND_ERROR",
  "CART_CREATE_ERROR",
  "CART_LINES_ADD_ERROR",
  "CART_LINES_UPDATE_ERROR",
  "CART_LINES_DELETE_ERROR",
] as const;
export type CheckoutErrorCode = (typeof CHECKOUT_ERROR_CODES)[number];

/**
 * ErrorCode
 * @description Union type of all error codes.
 */
export type ErrorCode =
  | AddressErrorCode
  | AuthErrorCode
  | CheckoutErrorCode
  | HTTPErrorCode
  | AccountErrorCode
  | "INPUT_ERROR";

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
 *   field: "email",
 *   status: 400,
 *   context: { email: "Invalid email format" },
 * } satisfies BaseError<"INPUT_ERROR">
 **/
export type BaseError<C extends ErrorCodeFormat = ErrorCode> = {
  /*
   * Error code. This code must be used as a key in translation.
   */
  code: C;
  /*
   * This field is optional and can be used to represent the context of the error.
   */
  context?: unknown;
  /*
   * This field is optional and can be used to represent the form field that errored.
   */
  field?: string;
  /*
   * This message is just for developers, eventually can be used as a fallback message on the frontend. Always prefer translating using the code.
   */
  message?: string;
  /*
   * HTTP status code. This is optional and can be used to represent the HTTP status of the error.
   */
  status?: number;
};
