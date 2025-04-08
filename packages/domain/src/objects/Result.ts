import { type BaseError } from "./Error";

export type Ok<T> = { data: T; ok: true };
export type Err<E extends BaseError = BaseError> = {
  error: E;
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
 */
export const ok = <T>(data: T): Ok<T> => ({ ok: true, data });

/**
 * Creates an Err result.
 */
export const err = <E extends BaseError = BaseError>(error: E): Err<E> => ({
  ok: false,
  error,
});

/**
 * ResultType - A utility type to extract the data type from a Result.
 * This is useful for getting the type of the data when you know the result is an Ok.
 */
export type OkResult<T> = T extends Ok<infer U> ? Ok<U>["data"] : never;

/**
 * ErrResult - A utility type to extract the error type from a Result.
 * This is useful for getting the type of the error when you know the result is an Err.
 */
export type ErrResult<T> = T extends Err<infer U> ? Err<U>["error"] : never;
