export type AccountError = {
  code: string;
  field: string | null;
  message: string | null;
};

export const httpErrorCodes = [
  "HTTP_ERROR",
  "NOT_FOUND_ERROR",
  "TOO_MANY_REQUESTS",
  "UNEXPECTED_HTTP_ERROR",
] as const;
export type HTTPErrorCode = (typeof httpErrorCodes)[number];

export type ErrorCode = HTTPErrorCode | "INPUT_ERROR";

/**
 * @type BaseError
 **/
export type BaseError = {
  /*
   * Error code. This code must be used as a key in translation.
   */
  code: ErrorCode;
  /*
   * This message is just for developers, eventually can be used as a fallback message on the frontend. Always prefer translating using the code.`
   */
  message: string;
  status?: number;
};

export type Ok<TRes> = { data: TRes; error: null };
export type Err<TErr extends BaseError = BaseError> = {
  data: null;
  error: TErr;
};
export type Result<TRes, TErr extends BaseError = BaseError> =
  | Ok<TRes>
  | Err<TErr>;
