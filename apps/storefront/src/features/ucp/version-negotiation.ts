import { type NextRequest, NextResponse } from "next/server";

import { UCP_CAPABILITY_REGISTRY } from "./capabilities";
import { UCP_VERSION } from "./config";
import {
  extractProfileUrlFromUcpAgentHeader,
  isValidUcpProfileUrl,
  negotiateCapabilities,
  type UcpCapabilityRegistry,
} from "./helpers/negotiation";

/**
 * Result of UCP version negotiation.
 * If negotiation succeeds, `ok` is true and the request should proceed.
 * If negotiation fails, `ok` is false and `errorResponse` contains the HTTP response to return.
 */
export interface VersionNegotiationResult {
  errorResponse?: NextResponse;
  negotiatedCapabilities?: UcpCapabilityRegistry;
  ok: boolean;
}

const PROFILE_FETCH_TIMEOUT_MS = 3000;

function createDiscoveryErrorResponse({
  code,
  content,
  status,
}: {
  code:
    | "invalid_profile_url"
    | "profile_malformed"
    | "profile_unreachable"
    | "version_unsupported";
  content: string;
  status: number;
}) {
  return NextResponse.json(
    {
      code,
      content,
    },
    { status },
  );
}

function toUcpCapabilityRegistry(value: unknown): UcpCapabilityRegistry | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const asRecord = value as Record<string, unknown>;
  const registry: UcpCapabilityRegistry = {};

  for (const [capabilityName, entries] of Object.entries(asRecord)) {
    if (!Array.isArray(entries)) {
      continue;
    }

    const validEntries = entries
      .map((entry) => {
        if (!entry || typeof entry !== "object") {
          return null;
        }

        const typedEntry = entry as Record<string, unknown>;

        if (typeof typedEntry.version !== "string") {
          return null;
        }

        const extendsValue = typedEntry.extends;

        if (
          typeof extendsValue !== "undefined" &&
          typeof extendsValue !== "string" &&
          !Array.isArray(extendsValue)
        ) {
          return null;
        }

        return {
          version: typedEntry.version,
          ...(typeof extendsValue !== "undefined"
            ? { extends: extendsValue as string | string[] }
            : {}),
        };
      })
      .filter(
        (entry): entry is { extends?: string | string[]; version: string } =>
          Boolean(entry),
      );

    if (validEntries.length > 0) {
      registry[capabilityName] = validEntries;
    }
  }

  return registry;
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
export async function validateUCPVersion(
  request: NextRequest,
): Promise<VersionNegotiationResult> {
  const ucpAgentHeader = request.headers.get("UCP-Agent");
  const profileUrl = extractProfileUrlFromUcpAgentHeader(ucpAgentHeader);

  if (!profileUrl || !isValidUcpProfileUrl(profileUrl)) {
    return {
      ok: false,
      errorResponse: createDiscoveryErrorResponse({
        code: "invalid_profile_url",
        content:
          "UCP-Agent header must include a valid HTTPS profile URL ending with /.well-known/ucp.",
        status: 400,
      }),
    };
  }

  let profileResponse: Response;

  try {
    profileResponse = await fetch(profileUrl, {
      redirect: "error",
      signal: AbortSignal.timeout(PROFILE_FETCH_TIMEOUT_MS),
    });
  } catch {
    return {
      ok: false,
      errorResponse: createDiscoveryErrorResponse({
        code: "profile_unreachable",
        content: "Failed to fetch platform UCP profile.",
        status: 424,
      }),
    };
  }

  if (!profileResponse.ok) {
    return {
      ok: false,
      errorResponse: createDiscoveryErrorResponse({
        code: "profile_unreachable",
        content: "Failed to fetch platform UCP profile.",
        status: 424,
      }),
    };
  }

  let profileJSON: unknown;

  try {
    profileJSON = await profileResponse.json();
  } catch {
    return {
      ok: false,
      errorResponse: createDiscoveryErrorResponse({
        code: "profile_malformed",
        content: "Platform profile is not valid JSON.",
        status: 422,
      }),
    };
  }

  const profile = profileJSON as {
    ucp?: {
      capabilities?: unknown;
      version?: unknown;
    };
  };

  if (typeof profile.ucp?.version !== "string") {
    return {
      ok: false,
      errorResponse: createDiscoveryErrorResponse({
        code: "profile_malformed",
        content: "Platform profile does not include a valid ucp.version.",
        status: 422,
      }),
    };
  }

  if (profile.ucp.version !== UCP_VERSION) {
    return {
      ok: false,
      errorResponse: createDiscoveryErrorResponse({
        code: "version_unsupported",
        content: `Unsupported UCP version: ${profile.ucp.version}. Supported version: ${UCP_VERSION}.`,
        status: 422,
      }),
    };
  }

  const platformCapabilities = toUcpCapabilityRegistry(
    profile.ucp.capabilities,
  );

  if (!platformCapabilities) {
    return {
      ok: false,
      errorResponse: createDiscoveryErrorResponse({
        code: "profile_malformed",
        content:
          "Platform profile does not include a valid capabilities registry.",
        status: 422,
      }),
    };
  }

  const negotiatedCapabilities = negotiateCapabilities({
    businessCapabilities: UCP_CAPABILITY_REGISTRY,
    platformCapabilities,
  });

  if (Object.keys(negotiatedCapabilities).length === 0) {
    return {
      ok: false,
      errorResponse: NextResponse.json(
        {
          ucp: {
            version: UCP_VERSION,
            status: "error",
            capabilities: {},
          },
          messages: [
            {
              type: "error",
              code: "capabilities_incompatible",
              content:
                "No compatible capabilities were negotiated between platform and business.",
              severity: "unrecoverable",
            },
          ],
        },
        { status: 200 },
      ),
    };
  }

  return {
    ok: true,
    negotiatedCapabilities,
  };
}
