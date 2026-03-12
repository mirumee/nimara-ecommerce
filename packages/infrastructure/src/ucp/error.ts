/**
 * Error code identifying the type of error.
 * Standard errors are defined in specification, freeform codes are permitted.
 * @link https://ucp.dev/draft/specification/reference/#error-code
 */
export type ErrorCode =
  | "mandate_required"
  | "agent_missing_key"
  | "mandate_invalid_signature"
  | "mandate_expired"
  | "mandate_scope_mismatch"
  | "merchant_authorization_invalid"
  | "merchant_authorization_missing"
  | string;

/**
 * Severity level indicating how the error affects the resource state.
 * @link https://ucp.dev/draft/specification/reference/#message-error
 */
export type ErrorSeverity =
  | "recoverable"
  | "requires_buyer_input"
  | "requires_buyer_review"
  | "unrecoverable";

/**
 * Content type for error message formatting.
 */
export type ContentType = "plain" | "markdown";

/**
 * Error message object as per UCP specification.
 * @link https://ucp.dev/draft/specification/reference/#message-error
 */
export interface MessageError {
  code: ErrorCode;
  content: string;
  content_type?: ContentType;
  path?: string;
  severity: ErrorSeverity;
  type: "error";
}

/**
 * UCP metadata object for responses.
 */
export interface UcpMetadata {
  capabilities?: Record<string, unknown>;
  payment_handlers?: Record<string, unknown>;
  services?: Record<string, unknown>;
  status?: "success" | "error";
  version: string;
}

/**
 * Error response as per UCP specification.
 * @link https://ucp.dev/draft/specification/reference/#error-response
 */
export interface ErrorResponse {
  continue_url?: string;
  messages: MessageError[];
  ucp: UcpMetadata;
}

/**
 * Create a message error object.
 */
export function createMessageError(
  code: ErrorCode,
  content: string,
  severity: ErrorSeverity,
  options?: {
    content_type?: ContentType;
    path?: string;
  },
): MessageError {
  return {
    type: "error",
    code,
    content,
    severity,
    path: options?.path,
    content_type: options?.content_type || "plain",
  };
}

/**
 * Create an error response object.
 */
export function createErrorResponse(
  messages: MessageError[],
  options?: {
    continue_url?: string;
    ucp_version?: string;
  },
): ErrorResponse {
  return {
    ucp: {
      version: options?.ucp_version || "draft",
      status: "error",
    },
    messages,
    continue_url: options?.continue_url,
  };
}
