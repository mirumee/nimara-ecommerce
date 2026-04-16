import { type CheckoutCreateRequest } from "@ucp-js/sdk";
import { type NextRequest, NextResponse } from "next/server";

import {
  convertToMessageErrors,
  deriveStatusFromErrors,
} from "@nimara/infrastructure/ucp/saleor/error-response-converter";

import { clientEnvs } from "@/envs/client";
import { idempotencyStorage } from "@/features/acp/acp";
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
    rootCapability: UCP_ROOT_CAPABILITIES.checkout,
  });

  const idempotencyKey = request.headers.get("Idempotency-Key");
  const requestId = request.headers.get("Request-Id") || "";

  storefrontLogger.debug("Received request to create checkout session", {
    idempotencyKey,
    requestId,
  });

  const { channelSlug } = await params;
  const channelValidationResult = validateChannelParam(channelSlug);

  if (!channelValidationResult.ok) {
    return channelValidationResult.errorResponse;
  }

  const body = (await request.json()) as CheckoutCreateRequest;

  if (idempotencyKey) {
    const cached = idempotencyStorage.get(idempotencyKey, body);

    if (cached) {
      if (cached.conflict) {
        storefrontLogger.debug(
          "Idempotency conflict - same key with different request body",
          {
            idempotencyKey,
          },
        );

        return idempotencyStorage.createConflictResponse();
      }

      storefrontLogger.debug("Idempotent request - returning cached response", {
        idempotencyKey,
      });

      return idempotencyStorage.createResponse(cached?.cached);
    }
  }

  const ucpService = await getUCPService({ channelSlug });

  const result = await ucpService.createCheckoutSession(body);

  if (!result.ok) {
    const messages = convertToMessageErrors(result.errors);
    const checkoutStatus = deriveStatusFromErrors(messages);
    const httpStatus = getHttpStatusFromErrors(result.errors);

    storefrontLogger.error("Failed to create checkout session", {
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
        includePaymentHandlers: true,
        continueUrl:
          checkoutStatus === "requires_escalation"
            ? new URL(
                "/checkout",
                clientEnvs.NEXT_PUBLIC_STOREFRONT_URL,
              ).toString()
            : undefined,
      }),
      {
        status: httpStatus,
        headers: {
          "Request-Id": requestId,
        },
      },
    );
  }

  const responseData = withUcpSuccessMetadata({
    payload: result.data as Record<string, unknown>,
    capabilities: responseCapabilities,
    includePaymentHandlers: true,
  });
  const responseStatus = 201;
  const responseHeaders = {
    "Request-Id": requestId,
    "Idempotency-Key": idempotencyKey || "",
  };

  if (idempotencyKey) {
    storefrontLogger.debug("Storing response for idempotency", {
      idempotencyKey,
      requestId,
    });

    idempotencyStorage.set(
      idempotencyKey,
      responseData,
      responseStatus,
      responseHeaders,
      body,
    );
  }

  return NextResponse.json(responseData, {
    status: responseStatus,
    headers: responseHeaders,
  });
}
