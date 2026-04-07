import { type BaseError } from "@nimara/domain/objects/Error";

import { mapSaleorErrorToUCP } from "./error-mapping";

/**
 * UCP-compliant message error object
 * Spec: https://ucp.dev/2026-01-23/specification/checkout/#message-error
 */
export type MessageError = {
  code: string;
  content: string;
  content_type?: "plain" | "markdown";
  path?: string; // RFC 9535 JSONPath
  severity?: "recoverable" | "requires_buyer_input" | "requires_buyer_review";
  type: "error" | "warning" | "info";
};

/**
 * Converts a domain error to a UCP-compliant MessageError.
 *
 * @param error - Domain error with Saleor code and message
 * @returns MessageError with severity, path, and UCP code
 *
 * @example
 * const error = { code: "INSUFFICIENT_STOCK", message: "Only 2 available" };
 * const msg = convertToMessageError(error);
 * // Returns: {
 * //   type: "error",
 * //   code: "out_of_stock",
 * //   severity: "recoverable",
 * //   content: "Only 2 available"
 * // }
 */
export function convertToMessageError(error: BaseError): MessageError {
  // Get original Saleor code from context
  const saleorCode =
    (error.context?.saleorCode as string | undefined) ?? error.code;

  // Get UCP mapping
  const mapping = mapSaleorErrorToUCP(saleorCode, error.message || "");

  return {
    type: "error",
    code: mapping.code,
    content: error.message || "An error occurred",
    content_type: "plain",
    path: mapping.path,
    severity: mapping.severity,
  };
}

/**
 * Converts an array of domain errors to UCP MessageError objects.
 *
 * @param errors - Array of domain errors
 * @returns Array of MessageError objects
 */
export function convertToMessageErrors(errors: BaseError[]): MessageError[] {
  return errors.map((error) => convertToMessageError(error));
}

/**
 * Derives checkout status from error severities.
 * Per UCP spec: https://ucp.dev/2026-01-23/specification/checkout/#error-handling
 *
 * @param messages - Array of error messages
 * @returns Appropriate checkout status
 *
 * @example
 * deriveStatusFromErrors([
 *   { severity: "recoverable", ... },
 *   { severity: "requires_buyer_input", ... }
 * ])
 * // Returns: "requires_escalation"
 */
export type CheckoutStatus =
  | "incomplete"
  | "requires_escalation"
  | "ready_for_complete"
  | "complete_in_progress"
  | "completed"
  | "canceled";

export function deriveStatusFromErrors(
  messages: MessageError[],
  currentStatus?: CheckoutStatus,
): CheckoutStatus {
  // Terminal states don't change
  if (currentStatus === "completed" || currentStatus === "canceled") {
    return currentStatus;
  }

  // Get highest severity
  const hasRequiresBuyerInput = messages.some(
    (m) => m.severity === "requires_buyer_input",
  );
  const hasRequiresBuyerReview = messages.some(
    (m) => m.severity === "requires_buyer_review",
  );
  const hasRecoverable = messages.some((m) => m.severity === "recoverable");

  // Priority: requires_escalation > incomplete > ready_for_complete
  if (hasRequiresBuyerInput || hasRequiresBuyerReview) {
    return "requires_escalation";
  }

  if (hasRecoverable) {
    return "incomplete";
  }

  // No errors
  return currentStatus ?? "ready_for_complete";
}

/**
 * Implements the UCP error processing algorithm.
 * Per spec: https://ucp.dev/2026-01-23/specification/checkout/#error-processing-algorithm
 *
 * Algorithm:
 * 1. Collect errors and partition by severity
 * 2. If recoverable errors exist: mark as incomplete, suggest fixes
 * 3. If requires_buyer_input errors: mark as requires_escalation
 * 4. If requires_buyer_review errors: mark as requires_escalation
 */
export type ErrorProcessingResult = {
  hasRecoverableErrors: boolean;
  messages: MessageError[];
  shouldHandoff: boolean; // Whether to hand off to continue_url
  status: CheckoutStatus;
};

export function processCheckoutErrors(
  errors: BaseError[],
  currentStatus?: CheckoutStatus,
): ErrorProcessingResult {
  const messages = convertToMessageErrors(errors);

  const recoverables = messages.filter((m) => m.severity === "recoverable");
  const buyerInputRequired = messages.filter(
    (m) => m.severity === "requires_buyer_input",
  );
  const buyerReviewRequired = messages.filter(
    (m) => m.severity === "requires_buyer_review",
  );

  const status = deriveStatusFromErrors(messages, currentStatus);

  return {
    messages,
    status,
    shouldHandoff:
      buyerInputRequired.length > 0 || buyerReviewRequired.length > 0,
    hasRecoverableErrors: recoverables.length > 0,
  };
}

/**
 * Groups errors by severity for logging and debugging.
 *
 * @param messages - Array of error messages
 * @returns Organized errors by severity
 */
export function groupErrorsBySeverity(messages: MessageError[]): {
  recoverable: MessageError[];
  requiresBuyerInput: MessageError[];
  requiresBuyerReview: MessageError[];
} {
  return {
    recoverable: messages.filter((m) => m.severity === "recoverable"),
    requiresBuyerInput: messages.filter(
      (m) => m.severity === "requires_buyer_input",
    ),
    requiresBuyerReview: messages.filter(
      (m) => m.severity === "requires_buyer_review",
    ),
  };
}
