import { type NextRequest, NextResponse } from "next/server";

import { checkoutSessionUpdateSchema } from "@nimara/infrastructure/acp/schema";
import { type ACPError } from "@nimara/infrastructure/acp/types";

import { idempotencyStorage } from "@/features/acp/acp";
import { revalidateTag } from "@/foundation/cache/cache";
import { validateChannelParam } from "@/foundation/validate-channel-param";
import { getACPService } from "@/services/acp";
import { storefrontLogger } from "@/services/logging";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ channelSlug: string; id: string }> },
) {
  const idempotencyKey = request.headers.get("Idempotency-Key");
  const requestId = request.headers.get("Request-Id") || "";

  if (idempotencyKey) {
    if (idempotencyKey) {
      const cached = idempotencyStorage.get(idempotencyKey);

      if (cached) {
        storefrontLogger.debug(
          "Idempotent request - returning cached response",
          {
            idempotencyKey,
          },
        );

        return idempotencyStorage.createResponse(cached);
      }
    }
  }

  const { channelSlug, id } = await params;
  const channelValidationResult = validateChannelParam(channelSlug);

  if (!channelValidationResult.ok) {
    return channelValidationResult.errorResponse;
  }

  const acpService = await getACPService({ channelSlug });

  // TODO: Validate if ID is checkout type or order type after checkout is completed.
  const result = await acpService.getCheckoutSession({
    checkoutSessionId: id,
  });

  if (!result.ok) {
    storefrontLogger.error(
      `Failed to fetch checkout session for channel ${channelSlug} and id ${id}`,
    );

    return NextResponse.json<ACPError>(
      {
        type: "invalid_request",
        code: "request_not_idempotent",
        message: "Failed to fetch checkout session.",
        param: "id",
      },
      { status: 500 },
    );
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

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ channelSlug: string; id: string }> },
) {
  const idempotencyKey = request.headers.get("Idempotency-Key");
  const requestId = request.headers.get("Request-Id") || "";

  if (idempotencyKey) {
    if (idempotencyKey) {
      const cached = idempotencyStorage.get(idempotencyKey);

      if (cached) {
        storefrontLogger.debug(
          "Idempotent request - returning cached response",
          {
            idempotencyKey,
          },
        );

        return idempotencyStorage.createResponse(cached);
      }
    }
  }

  const { channelSlug, id } = await params;
  const acpService = await getACPService({ channelSlug });

  const body = (await request.json()) as Record<string, unknown>;
  const parsedBody = checkoutSessionUpdateSchema.safeParse(body);

  if (!parsedBody.success) {
    return NextResponse.json<ACPError>(
      {
        type: "invalid_request",
        code: "request_not_idempotent",
        message: parsedBody.error.issues[0]?.message,
        param: parsedBody.error.issues[0]?.path.join("."),
      },
      { status: 400 },
    );
  }

  if (Object.keys(parsedBody.data).length === 0) {
    return NextResponse.json<ACPError>(
      {
        type: "invalid_request",
        code: "request_not_idempotent",
        message: "At least one field must be provided to update the checkout.",
        param: "body",
      },
      { status: 400 },
    );
  }

  const result = await acpService.updateCheckoutSession({
    checkoutSessionId: id,
    data: parsedBody.data,
  });

  if (!result.ok) {
    return NextResponse.json<ACPError>(result.error, { status: 500 });
  }

  // Revalidate cache for this particular checkout session ID on update on success
  revalidateTag(`ACP:CHECKOUT_SESSION:${id}`);

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
