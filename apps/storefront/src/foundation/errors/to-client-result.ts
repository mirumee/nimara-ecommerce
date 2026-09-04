import type { BaseError } from "@nimara/domain/objects/Error";
import { err, type Result } from "@nimara/domain/objects/Result";
import type { NonEmptyArray } from "@nimara/domain/objects/types";

export type ClientSafeError = Pick<BaseError, "code" | "field">;

const toClientError = (error: BaseError): ClientSafeError =>
  error.field === undefined
    ? { code: error.code }
    : { code: error.code, field: error.field };

const mapNonEmpty = <T, U>(
  [head, ...rest]: NonEmptyArray<T>,
  fn: (item: T) => U,
): NonEmptyArray<U> => [fn(head), ...rest.map(fn)];

export const toClientResult = <T, E extends BaseError = BaseError>(
  result: Result<T, E>,
): Result<T, ClientSafeError> =>
  result.ok ? result : err(mapNonEmpty(result.errors, toClientError));
