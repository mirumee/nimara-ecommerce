import { type NextRequest, NextResponse } from "next/server";

import { UCP_VERSION } from "./config";

/**
 * Result of UCP version negotiation.
 * If negotiation succeeds, `ok` is true and the request should proceed.
 * If negotiation fails, `ok` is false and `errorResponse` contains the HTTP response to return.
 */
export interface VersionNegotiationResult {
  errorResponse?: NextResponse;
  ok: boolean;
}

/**
 * Parses the UCP-Agent header to extract the version string.
 *
 * Expected format: 'profile="..."; version="YYYY-MM-DD"'
 *
 * @param ucpAgentHeader - The UCP-Agent header value
 * @returns The version string, or null if not found or invalid
 *
 * @example
 * parseUCPAgentVersion('profile="..."; version="2026-01-23"')
 * // Returns: "2026-01-23"
 */
function parseUCPAgentVersion(ucpAgentHeader: string | null): string | null {
  if (!ucpAgentHeader) {
    return null;
  }

  const versionMatch = ucpAgentHeader.match(/version="([^"]+)"/);

  return versionMatch?.[1] ?? null;
}

/**
 * Checks if the requested version is compatible with the supported version.
 *
 * Currently, only exact version matches are supported.
 * Future implementations may support version ranges or compatibility windows.
 *
 * @param requestedVersion - The version from the UCP-Agent header
 * @param supportedVersion - The version supported by this server
 * @returns true if versions are compatible
 */
function isVersionCompatible(
  requestedVersion: string,
  supportedVersion: string,
): boolean {
  return requestedVersion === supportedVersion;
}

/**
 * Validates UCP-Agent header and version negotiation for incoming requests.
 *
 * This function should be called at the beginning of every UCP endpoint to ensure
 * version compatibility. If the version is incompatible, it returns a 400 Bad Request error.
 *
 * @param request - The Next.js request object
 * @returns VersionNegotiationResult with ok=true if validation passes, ok=false with error response otherwise
 *
 * @example
 * export async function POST(request: NextRequest) {
 *   const negotiation = validateUCPVersion(request);
 *   if (!negotiation.ok) {
 *     return negotiation.errorResponse;
 *   }
 *   // Continue with request processing
 * }
 */
export function validateUCPVersion(
  request: NextRequest,
): VersionNegotiationResult {
  const ucpAgentHeader = request.headers.get("UCP-Agent");
  const requestedVersion = parseUCPAgentVersion(ucpAgentHeader);

  if (requestedVersion === null) {
    return { ok: true };
  }

  if (!isVersionCompatible(requestedVersion, UCP_VERSION)) {
    return {
      ok: false,
      errorResponse: NextResponse.json(
        {
          error: "Unsupported protocol version",
          requested: requestedVersion,
          supported: UCP_VERSION,
        },
        {
          status: 400,
        },
      ),
    };
  }

  return { ok: true };
}
