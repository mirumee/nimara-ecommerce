import { type NextRequest, NextResponse } from "next/server";

import { checkoutSessionCreateSchema } from "@nimara/infrastructure/acp/schema";
import { type ACPError } from "@nimara/infrastructure/acp/types";

import { idempotencyStorage } from "@/features/acp/acp";
import { validateChannelParam } from "@/foundation/validate-channel-param";
import { getACPService } from "@/services/acp";
import { storefrontLogger } from "@/services/logging";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ channelSlug: string }> },
) {
  const authHeader = request.headers.get("Authorization");
  const idempotencyKey = request.headers.get("Idempotency-Key");
  const requestId = request.headers.get("Request-Id") || "";
  const signature = request.headers.get("Signature");
  const apiVersion = request.headers.get("Api-Version");

  storefrontLogger.debug("Received request to create checkout session", {
    authHeader,
    idempotencyKey,
    requestId,
    signature,
    apiVersion,
  });

  if (idempotencyKey) {
    const cached = idempotencyStorage.get(idempotencyKey);

    if (cached) {
      storefrontLogger.debug("Idempotent request - returning cached response", {
        idempotencyKey,
      });

      return idempotencyStorage.createResponse(cached);
    }
  }

  const { channelSlug } = await params;
  const channelValidationResult = validateChannelParam(channelSlug);

  if (!channelValidationResult.ok) {
    return channelValidationResult.errorResponse;
  }

  const body = (await request.json()) as Record<string, unknown>;
  const parsedBody = checkoutSessionCreateSchema.safeParse(body);

  if (!parsedBody.success) {
    storefrontLogger.error("Invalid request body", {
      errors: parsedBody.error.issues,
    });

    return NextResponse.json<ACPError>(
      {
        type: "invalid_request",
        code: "request_not_idempotent",
        message: "Invalid request body.",
        param: "body",
      },
      {
        status: 400,
        headers: {
          "Request-Id": requestId,
        },
      },
    );
  }

  const acpService = await getACPService({ channelSlug });

  const result = await acpService.createCheckoutSession({
    input: parsedBody.data,
  });

  if (!result.ok) {
    storefrontLogger.error("Error creating checkout session", {
      errors: result.error,
    });

    return NextResponse.json<ACPError>(result.error, {
      status: 500,
      headers: {
        "Request-Id": requestId,
      },
    });
  }

  const responseData = result.data;
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
    );
  }

  return NextResponse.json(responseData, {
    status: responseStatus,
    headers: responseHeaders,
  });
}
