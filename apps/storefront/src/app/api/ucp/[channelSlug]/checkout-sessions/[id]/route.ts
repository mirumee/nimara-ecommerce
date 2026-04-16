import { type CheckoutUpdateRequest } from "@ucp-js/sdk";
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
import { revalidateTag } from "@/foundation/cache/cache";
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
    rootCapability: UCP_ROOT_CAPABILITIES.checkout,
  });

  const idempotencyKey = request.headers.get("Idempotency-Key");
  const requestId = request.headers.get("Request-Id") || "";

  const { channelSlug, id } = await params;
  const channelValidationResult = validateChannelParam(channelSlug);

  if (!channelValidationResult.ok) {
    return channelValidationResult.errorResponse;
  }

  if (idempotencyKey) {
    const cached = idempotencyStorage.get(idempotencyKey);

    if (cached) {
      storefrontLogger.debug(
        "[UCP] Idempotent request - returning cached response",
        {
          idempotencyKey,
        },
      );

      return idempotencyStorage.createResponse(cached.cached);
    }
  }

  const ucpService = await getUCPService({ channelSlug });

  // TODO: Validate if ID is checkout type or order type after checkout is completed.
  const result = await ucpService.getCheckoutSession({ id });

  if (!result.ok) {
    const messages = convertToMessageErrors(result.errors);
    const checkoutStatus = deriveStatusFromErrors(messages);
    const httpStatus = getHttpStatusFromErrors(result.errors);

    storefrontLogger.error(
      `[UCP] Failed to fetch checkout session for id ${id}`,
      {
        errors: result.errors,
        messages,
        checkoutStatus,
        httpStatus,
      },
    );

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
  const responseStatus = 200;
  const responseHeaders = {
    "Request-Id": requestId,
    "Idempotency-Key": idempotencyKey || "",
  };

  if (idempotencyKey) {
    storefrontLogger.debug("[UCP] Storing response for idempotency", {
      idempotencyKey,
      requestId,
    });

    idempotencyStorage.set(
      idempotencyKey,
      responseData,
      responseStatus,
      responseHeaders,
    );
  }

  return NextResponse.json(responseData, {
    status: responseStatus,
    headers: responseHeaders,
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ channelSlug: string; id: string }> },
) {
  return PUT(request, { params });
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
    rootCapability: UCP_ROOT_CAPABILITIES.checkout,
  });

  const idempotencyKey = request.headers.get("Idempotency-Key");
  const requestId = request.headers.get("Request-Id") || "";

  const { channelSlug, id } = await params;
  const channelValidationResult = validateChannelParam(channelSlug);

  if (!channelValidationResult.ok) {
    return channelValidationResult.errorResponse;
  }

  const body = (await request.json()) as CheckoutUpdateRequest;

  if (Object.keys(body as Record<string, unknown>).length === 0) {
    return NextResponse.json(
      [{ code: "BAD_REQUEST_ERROR", message: "Request body is required." }],
      { status: 400 },
    );
  }

  if (idempotencyKey) {
    const cached = idempotencyStorage.get(idempotencyKey, body);

    if (cached) {
      if (cached.conflict) {
        storefrontLogger.debug(
          "[UCP] Idempotency conflict - same key with different request body",
          {
            idempotencyKey,
          },
        );

        return idempotencyStorage.createConflictResponse();
      }

      storefrontLogger.debug(
        "[UCP] Idempotent request - returning cached response",
        {
          idempotencyKey,
        },
      );

      return idempotencyStorage.createResponse(cached.cached);
    }
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

    storefrontLogger.error(
      `[UCP] Failed to update checkout session for id ${id}`,
      {
        errors: result.errors,
        messages,
        checkoutStatus,
        httpStatus,
      },
    );

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

  // Revalidate cache for this particular checkout session ID on update on success
  revalidateTag(`UCP:CHECKOUT_SESSION:${id}`);

  const responseData = withUcpSuccessMetadata({
    payload: result.data as Record<string, unknown>,
    capabilities: responseCapabilities,
    includePaymentHandlers: true,
  });
  const responseStatus = 200;
  const responseHeaders = {
    "Request-Id": requestId,
    "Idempotency-Key": idempotencyKey || "",
  };

  if (idempotencyKey) {
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
