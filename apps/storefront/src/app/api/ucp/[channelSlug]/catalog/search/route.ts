import { type NextRequest, NextResponse } from "next/server";

import type { CatalogSearchInput } from "@nimara/infrastructure/ucp/types";

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

type CatalogSearchRequest = CatalogSearchInput & {
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
    rootCapability: UCP_ROOT_CAPABILITIES.catalogSearch,
  });

  const requestId = request.headers.get("Request-Id") || "";

  const { channelSlug } = await params;
  const channelValidationResult = validateChannelParam(channelSlug);

  if (!channelValidationResult.ok) {
    return channelValidationResult.errorResponse;
  }

  const body = (await request.json()) as CatalogSearchRequest;

  if (!body.query && !body.filters) {
    return NextResponse.json(
      toUcpErrorResponseBody({
        capabilities: responseCapabilities,
        messages: [
          {
            type: "error",
            code: "invalid",
            content: "At least one of query or filters is required",
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

    const result = await ucpService.catalogSearch({
      query: body.query,
      filters: body.filters,
      pagination: body.pagination,
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
    storefrontLogger.error("[UCP] Catalog search failed", { error });

    return NextResponse.json(
      toUcpErrorResponseBody({
        capabilities: responseCapabilities,
        messages: [
          {
            type: "error",
            code: "internal_error",
            content: "An internal error occurred during search",
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
