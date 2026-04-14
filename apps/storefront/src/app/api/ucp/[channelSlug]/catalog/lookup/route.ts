import { type NextRequest, NextResponse } from "next/server";

import type { CatalogLookupInput } from "@nimara/infrastructure/ucp/types";

import {
  getResponseCapabilities,
  toUcpErrorResponseBody,
  UCP_ROOT_CAPABILITIES,
  withUcpSuccessMetadata,
} from "@/features/ucp/helpers/response";
import { validateUCPVersion } from "@/features/ucp/version-negotiation";
import { validateChannelParam } from "@/foundation/validate-channel-param";
import { storefrontLogger } from "@/services/logging";
import { getUCPService } from "@/services/ucp";

type CatalogLookupRequest = CatalogLookupInput & {
  signals?: Record<string, unknown>;
};

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ channelSlug: string }> },
) {
  const versionNegotiation = await validateUCPVersion(request);

  if (!versionNegotiation.ok) {
    return versionNegotiation.errorResponse;
  }

  const responseCapabilities = getResponseCapabilities({
    negotiatedCapabilities: versionNegotiation.negotiatedCapabilities,
    rootCapability: UCP_ROOT_CAPABILITIES.catalogLookup,
  });

  const requestId = request.headers.get("Request-Id") || "";

  const { channelSlug } = await params;
  const channelValidationResult = validateChannelParam(channelSlug);

  if (!channelValidationResult.ok) {
    return channelValidationResult.errorResponse;
  }

  const body = (await request.json()) as CatalogLookupRequest;

  if (!body.ids || body.ids.length === 0) {
    return NextResponse.json(
      toUcpErrorResponseBody({
        capabilities: responseCapabilities,
        messages: [
          {
            type: "error",
            code: "invalid",
            content: "ids array is required and must not be empty",
            severity: "recoverable",
          },
        ],
        status: "error",
        includePaymentHandlers: false,
      }),
      { status: 400, headers: { "Request-Id": requestId } },
    );
  }

  if (body.ids.length > 50) {
    return NextResponse.json(
      toUcpErrorResponseBody({
        capabilities: responseCapabilities,
        messages: [
          {
            type: "error",
            code: "request_too_large",
            content: "Maximum 50 identifiers per request",
            severity: "recoverable",
          },
        ],
        status: "error",
        includePaymentHandlers: false,
      }),
      { status: 400, headers: { "Request-Id": requestId } },
    );
  }

  try {
    const ucpService = await getUCPService({ channelSlug });

    const result = await ucpService.catalogLookup({
      ids: [...new Set(body.ids)],
      filters: body.filters,
      context: body.context,
    });

    const responseData = withUcpSuccessMetadata({
      payload: result as Record<string, unknown>,
      capabilities: responseCapabilities,
      includePaymentHandlers: false,
    });

    return NextResponse.json(responseData, {
      status: 200,
      headers: { "Request-Id": requestId },
    });
  } catch (error) {
    storefrontLogger.error("[UCP] Catalog lookup failed", { error });

    return NextResponse.json(
      toUcpErrorResponseBody({
        capabilities: responseCapabilities,
        messages: [
          {
            type: "error",
            code: "internal_error",
            content: "An internal error occurred during lookup",
            severity: "recoverable",
          },
        ],
        status: "error",
        includePaymentHandlers: false,
      }),
      { status: 500, headers: { "Request-Id": requestId } },
    );
  }
}
