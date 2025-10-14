import { revalidateTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";

import { checkoutSessionCompleteSchema } from "@nimara/infrastructure/acp/schema";

import { idempotencyStorage } from "@/lib/acp";
import { validateChannelParam } from "@/lib/channel";
import { getACPService } from "@/services/acp";
import { storefrontLogger } from "@/services/logging";

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

  const channelValidationResult = validateChannelParam(channelSlug);

  if (!channelValidationResult.ok) {
    return channelValidationResult.errorResponse;
  }

  const acpService = await getACPService({ channelSlug });

  const body = (await request.json()) as Record<string, unknown>;

  const parsedBody = checkoutSessionCompleteSchema.safeParse(body);

  if (!parsedBody.success) {
    storefrontLogger.error("Invalid request body", {
      errors: parsedBody.error.issues,
    });

    return NextResponse.json(
      {
        status: "Invalid request body",
        errors: parsedBody.error.issues.map((i) => ({
          message: i.message,
          path: i.path.join("."),
        })),
      },
      { status: 400 },
    );
  }

  const result = await acpService.completeCheckoutSession({
    checkoutSessionId: id,
    checkoutSessionComplete: parsedBody.data,
  });

  if (!result.ok) {
    return NextResponse.json(
      { errors: result.errors },
      { status: 400, statusText: "Failed to complete checkout session" },
    );
  }

  // Revalidate the cart page to reflect the updated checkout session state
  revalidateTag(`cart-${channelSlug}`);

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
