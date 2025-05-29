import { type NonEmptyArray } from "ts-essentials";

import type * as saleor from "@nimara/codegen/schema";
import {
  type AppErrorCode,
  type BaseError,
} from "@nimara/domain/objects/Error";

// Feel free to add more error codes here as needed
type SaleorErrorCode =
  | saleor.AccountErrorCode
  | saleor.OrderErrorCode
  | saleor.CheckoutErrorCode
  | saleor.MetadataErrorCode;

/**
 * This function maps Saleor error codes to App error codes.
 * @param code - The Saleor error code to be mapped.
 * @returns The mapped App error code.
 */
export const mapSaleorErrorCode = (code: SaleorErrorCode): AppErrorCode => {
  switch (code) {
    case "GRAPHQL_ERROR":
      return "HTTP_ERROR";
    case "INVALID":
      return "INVALID_VALUE_ERROR";
    case "JWT_INVALID_TOKEN":
      return "JWT_INVALID_TOKEN_ERROR";
    case "JWT_SIGNATURE_EXPIRED":
      return "JWT_SIGNATURE_EXPIRED_ERROR";
    case "NOT_FOUND":
      return "NOT_FOUND_ERROR";
    case "REQUIRED":
      return "REQUIRED_ERROR";
    case "UNIQUE":
      return "UNIQUE_ERROR";
    case "VOUCHER_NOT_APPLICABLE":
      return "VOUCHER_NOT_APPLICABLE_ERROR";

    default:
      console.warn(
        "Unhandled Saleor error code, defaulting to UNKNOWN_ERROR",
        code,
      );

      return "UNKNOWN_ERROR";
  }
};

/**
 * This function handles mutation errors returned from Saleor.
 * It maps Saleor error codes to App error codes and returns an array of App errors.
 * @param errors - The Saleor errors to be handled.
 * @returns An array of App errors.
 */
export const handleMutationErrors = (
  errors: {
    code: SaleorErrorCode;
    field?: string | null;
    message?: string | null;
  }[],
): NonEmptyArray<BaseError> => {
  if (errors.length === 0) {
    return [
      {
        code: "UNKNOWN_ERROR",
        message: "No errors were returned.",
      },
    ];
  }

  return errors.map((error) => ({
    code: mapSaleorErrorCode(error.code),
    message: error.message ?? "An unknown error occurred.",
    field: error.field,
  })) as NonEmptyArray<BaseError>;
};
