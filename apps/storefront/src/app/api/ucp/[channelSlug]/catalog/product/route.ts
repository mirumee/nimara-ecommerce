import { type NextRequest, NextResponse } from "next/server";

import type { CatalogGetProductInput } from "@nimara/infrastructure/ucp/types";

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

type GetProductRequest = CatalogGetProductInput & {
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

  const body = (await request.json()) as GetProductRequest;

  if (!body.id) {
    return NextResponse.json(
      toUcpErrorResponseBody({
        capabilities: responseCapabilities,
        messages: [
          {
            type: "error",
            code: "invalid",
            content: "id is required",
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

    const result = await ucpService.catalogGetProduct({
      id: body.id,
      selected: body.selected,
      preferences: body.preferences,
      filters: body.filters,
      context: body.context,
    });

    if (!result) {
      return NextResponse.json(
        toUcpErrorResponseBody({
          capabilities: responseCapabilities,
          messages: [
            {
              type: "error",
              code: "not_found",
              content: "Product not found",
              severity: "recoverable",
            },
          ],
          status: "error",
          includePaymentHandlers: false,
        }),
        { status: 200, headers: { "Request-Id": requestId } },
      );
    }

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
    storefrontLogger.error("[UCP] Get product failed", { error });

    return NextResponse.json(
      toUcpErrorResponseBody({
        capabilities: responseCapabilities,
        messages: [
          {
            type: "error",
            code: "internal_error",
            content: "An internal error occurred retrieving product",
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
