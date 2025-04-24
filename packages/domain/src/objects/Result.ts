import { type BaseError } from "./Error";
import { type NonEmptyArray } from "./types";

/**
 * Ok - Type representing a successful result.
 */
export type Ok<T> = { data: T; errors?: never; ok: true };

/**
 * Err - Type representing an error result.
 */
export type Err<E extends BaseError = BaseError> = {
  data?: never;
  errors: NonEmptyArray<E>;
  ok: false;
};

/**
 * Result - Type representing the result of an operation.
 * It can either be an Ok (success) or an Err (failure).
 * This is useful for handling operations that can either succeed or fail.
 * @template T - The type of the result data.
 * @template E - The type of the error data. Defaults to BaseError.
 * @example
 * const result: Result<string> = { data: "Success", ok: true };
 * const errorResult: Result<null, BaseError> = {
 *   error: { code: "INPUT_ERROR", message: "Invalid input" },
 *   ok: false,
 * };
 */
export type Result<T, E extends BaseError = BaseError> = Ok<T> | Err<E>;

/**
 * AsyncResult - A wrapper for a Promise that resolves to a Result.
 * This is useful for handling asynchronous operations that can either succeed or fail.
 */
export type AsyncResult<T, E extends BaseError = BaseError> = Promise<
  Result<T, E>
>;

/**
 * Creates an Ok result.
 * @param data - The data to be returned in the Result.
 * @example
 * const result = ok("Success");
 * // result: { data: "Success", ok: true }
 */
export const ok = <T>(data: T): Ok<T> => ({ ok: true, data });

/**
 * Creates an Err result.
 * @example
 * const result = err<BaseError<"INPUT_ERROR">>({
 *  code: "INPUT_ERROR",
 *  message: "Invalid input",
 *  field: "email",
 *  status: 400,
 *  context: { email: "Invalid email format" },
 * });
 */
export function err<E extends BaseError = BaseError>(
  errors: NonEmptyArray<E>,
): Err<E> {
  return { ok: false, errors };
}

/**
 * ResultType - A utility type to extract the data type from a Result.
 * This is useful for getting the type of the data when you know the result is an Ok.
 */
export type OkResult<T> = T extends Ok<infer U> ? Ok<U>["data"] : never;
