import { type CheckoutUpdateRequest } from "@ucp-js/sdk";
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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ channelSlug: string; id: string }> },
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

  const { channelSlug, id } = await params;
  const channelValidationResult = validateChannelParam(channelSlug);

  if (!channelValidationResult.ok) {
    return channelValidationResult.errorResponse;
  }

  const ucpService = await getUCPService({ channelSlug });
  const result = await ucpService.getCheckoutSession({ id });

  if (!result.ok) {
    const messages = convertToMessageErrors(result.errors);
    const checkoutStatus = deriveStatusFromErrors(messages);
    const httpStatus = getHttpStatusFromErrors(result.errors);

    storefrontLogger.error(`[UCP] Failed to fetch cart for id ${id}`, {
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
    status: 200,
    headers: { "Request-Id": requestId },
  });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ channelSlug: string; id: string }> },
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

  const { channelSlug, id } = await params;
  const channelValidationResult = validateChannelParam(channelSlug);

  if (!channelValidationResult.ok) {
    return channelValidationResult.errorResponse;
  }

  const body = (await request.json()) as CheckoutUpdateRequest;

  if (Object.keys(body).length === 0) {
    return NextResponse.json(
      toUcpErrorResponseBody({
        capabilities: responseCapabilities,
        messages: [
          {
            type: "error",
            code: "invalid",
            content: "Request body is required",
            severity: "recoverable",
          },
        ],
        status: "incomplete",
        includePaymentHandlers: false,
      }),
      { status: 400, headers: { "Request-Id": requestId } },
    );
  }

  const ucpService = await getUCPService({ channelSlug });

  const result = await ucpService.updateCheckoutSession({
    ...body,
    id,
  });

  if (!result.ok) {
    const messages = convertToMessageErrors(result.errors);
    const checkoutStatus = deriveStatusFromErrors(messages);
    const httpStatus = getHttpStatusFromErrors(result.errors);

    storefrontLogger.error(`[UCP] Failed to update cart for id ${id}`, {
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
    status: 200,
    headers: { "Request-Id": requestId },
  });
}
