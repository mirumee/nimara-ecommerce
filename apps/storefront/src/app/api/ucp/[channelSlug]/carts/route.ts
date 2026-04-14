import { type NextRequest, NextResponse } from "next/server";

import {
  convertToMessageErrors,
  deriveStatusFromErrors,
} from "@nimara/infrastructure/ucp/saleor/error-response-converter";

import { clientEnvs } from "@/envs/client";
import {
  getResponseCapabilities,
  toUcpErrorResponseBody,
  UCP_ROOT_CAPABILITIES,
  withUcpSuccessMetadata,
} from "@/features/ucp/helpers/response";
import { validateUCPVersion } from "@/features/ucp/version-negotiation";
import { getHttpStatusFromErrors } from "@/foundation/http/error-to-status";
import { validateChannelParam } from "@/foundation/validate-channel-param";
import { storefrontLogger } from "@/services/logging";
import { getUCPService } from "@/services/ucp";

type CartCreateRequest = {
  buyer?: Record<string, unknown>;
  context?: Record<string, unknown>;
  line_items: Array<{
    item: { id: string };
    quantity: number;
  }>;
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
    rootCapability: UCP_ROOT_CAPABILITIES.cart,
  });

  const requestId = request.headers.get("Request-Id") || "";

  const { channelSlug } = await params;
  const channelValidationResult = validateChannelParam(channelSlug);

  if (!channelValidationResult.ok) {
    return channelValidationResult.errorResponse;
  }

  const body = (await request.json()) as CartCreateRequest;

  const ucpService = await getUCPService({ channelSlug });

  const result = await ucpService.createCheckoutSession({
    line_items: body.line_items,
    ...(body.buyer ? { buyer: body.buyer } : {}),
    ...(body.context ? { context: body.context } : {}),
    ...(body.signals ? { signals: body.signals } : {}),
  } as Parameters<typeof ucpService.createCheckoutSession>[0]);

  if (!result.ok) {
    const messages = convertToMessageErrors(result.errors);
    const checkoutStatus = deriveStatusFromErrors(messages);
    const httpStatus = getHttpStatusFromErrors(result.errors);

    storefrontLogger.error("[UCP] Failed to create cart", {
      errors: result.errors,
      messages,
      checkoutStatus,
      httpStatus,
    });

    return NextResponse.json(
      toUcpErrorResponseBody({
        capabilities: responseCapabilities,
        messages,
        status: checkoutStatus,
        includePaymentHandlers: false,
        continueUrl: new URL(
          "/",
          clientEnvs.NEXT_PUBLIC_STOREFRONT_URL,
        ).toString(),
      }),
      {
        status: httpStatus,
        headers: { "Request-Id": requestId },
      },
    );
  }

  const responseData = withUcpSuccessMetadata({
    payload: result.data as Record<string, unknown>,
    capabilities: responseCapabilities,
    includePaymentHandlers: false,
  });

  return NextResponse.json(responseData, {
    status: 201,
    headers: { "Request-Id": requestId },
  });
}
