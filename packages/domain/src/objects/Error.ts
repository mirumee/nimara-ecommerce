// TODO: Remove this in favor of BaseError
export type AccountError = {
  code: string;
  field: string | null;
  message: string | null;
};

/**
 * @description Error codes related to HTTP errors.
 */
export const HTTP_ERROR_CODES = [
  "HTTP_ERROR",
  "NOT_FOUND_ERROR",
  "TOO_MANY_REQUESTS",
  "UNEXPECTED_HTTP_ERROR",
] as const;
export type HTTPErrorCode = (typeof HTTP_ERROR_CODES)[number];

/**
 * @description Error codes related to authentication and authorization.
 */
export const AUTH_ERROR_CODES = ["PASSWORD_CHANGE_FAILED"] as const;
export type AuthErrorCode = (typeof AUTH_ERROR_CODES)[number];

/**
 * @description Error codes related to customer account and its actions.
 */
export const ACCOUNT_ERROR_CODES = [
  "ACCESS_TOKEN_NOT_FOUND",
  "ACCOUNT_CREATE_FAILED",
  "ACCOUNT_DELETE_FAILED",
  "ACCOUNT_UPDATE_FAILED",
  "ADDRESS_CREATE_FAILED",
  "ADDRESS_DELETE_FAILED",
  "ADDRESS_UPDATE_FAILED",
  "ACCOUNT_REQUEST_DELETION_FAILED",
  "ADDRESS_SET_DEFAULT_FAILED",
  "EMAIL_CHANGE_CONFIRMATION_FAILED",
  "EMAIL_CHANGE_REQUEST_FAILED",
] as const;
export type AccountErrorCode = (typeof ACCOUNT_ERROR_CODES)[number];

/**
 * ErrorCode
 * @description Union type of all error codes.
 */
export type ErrorCode =
  | AuthErrorCode
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
 * @property {string} [message] - This message is just for developers, eventually can be used as a fallback message on the frontend. Always prefer translating using the code.
 * @property {number} [status] - HTTP status code. This is optional and can be used to represent the HTTP status of the error.
 * @property {string} [field] - This field is optional and can be used to represent the form field that errored.
 **/
export type BaseError = {
  /*
   * Error code. This code must be used as a key in translation.
   */
  code: ErrorCode;
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
