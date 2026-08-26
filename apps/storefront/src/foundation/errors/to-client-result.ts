import type { BaseError } from "@nimara/domain/objects/Error";
import { err, type Result } from "@nimara/domain/objects/Result";
import type { NonEmptyArray } from "@nimara/domain/objects/types";

/**
 * What a Server Action may hand back to the browser: the translation key and,
 * for a field-level error, which field it belongs to. Everything else on
 * `BaseError` (`message`, `status`, `context`, `originalError`) is developer
 * diagnostics or upstream provider detail and must not reach the client.
 */
export type ClientSafeError = Pick<BaseError, "code" | "field">;

const toClientError = (error: BaseError): ClientSafeError =>
  error.field === undefined
    ? { code: error.code }
    : { code: error.code, field: error.field };

/*
 * A plain `.map` on a `NonEmptyArray` (a `[T, ...T[]]` tuple) widens the
 * result to `U[]`. Destructuring into a head and a rest array and rebuilding
 * the tuple keeps the non-empty guarantee in the return type without a cast.
 */
const mapNonEmpty = <T, U>(
  [head, ...rest]: NonEmptyArray<T>,
  fn: (item: T) => U,
): NonEmptyArray<U> => [fn(head), ...rest.map(fn)];

/**
 * Server Action response boundary: narrows any `Result` to what an anonymous
 * client may see before it is serialized to the browser. Apply this to every
 * exit of a `"use server"` action, including one built inline by the action
 * itself, so no provider or service detail leaks by way of a field a future
 * change adds to `BaseError`.
 */
export const toClientResult = <T, E extends BaseError = BaseError>(
  result: Result<T, E>,
): Result<T, ClientSafeError> =>
  result.ok ? result : err(mapNonEmpty(result.errors, toClientError));
