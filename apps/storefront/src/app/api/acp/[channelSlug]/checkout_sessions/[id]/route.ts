import { revalidateTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";

import { saleorAcPService } from "@nimara/infrastructure/mcp/saleor/service";
import { checkoutSessionUpdateSchema } from "@nimara/infrastructure/mcp/schema";
import { type ACPError } from "@nimara/infrastructure/mcp/types";

import { clientEnvs } from "@/envs/client";
import { MARKETS } from "@/regions/config";
import { storefrontLogger } from "@/services/logging";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ channelSlug: string; id: string }> },
) {
  const { channelSlug, id } = await params;

  const marketData = Object.values(MARKETS).find(
    (market) => market.channel === channelSlug,
  );

  if (!marketData) {
    return NextResponse.json<ACPError>(
      {
        type: "invalid_request",
        code: "request_not_idempotent",
        message:
          "Invalid channel slug provided. This channel is not supported.",
        param: "channelSlug",
      },
      { status: 400 },
    );
  }

  const acpService = saleorAcPService({
    apiUrl: clientEnvs.NEXT_PUBLIC_SALEOR_API_URL,
    logger: storefrontLogger,
    channel: channelSlug,
    storefrontUrl: clientEnvs.NEXT_PUBLIC_STOREFRONT_URL,
  });

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

  return NextResponse.json(result.data);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ channelSlug: string; id: string }> },
) {
  const { channelSlug, id } = await params;

  const marketData = Object.values(MARKETS).find(
    (market) => market.channel === channelSlug,
  );

  if (!marketData) {
    return NextResponse.json<ACPError>(
      {
        type: "invalid_request",
        code: "request_not_idempotent",
        message:
          "Invalid channel slug provided. This channel is not supported.",
        param: "channelSlug",
      },
      { status: 400 },
    );
  }

  const acpService = saleorAcPService({
    apiUrl: clientEnvs.NEXT_PUBLIC_SALEOR_API_URL,
    logger: storefrontLogger,
    channel: channelSlug,
    storefrontUrl: clientEnvs.NEXT_PUBLIC_STOREFRONT_URL,
  });

  const body = (await request.json()) as Record<string, unknown>;

  const parsedBody = checkoutSessionUpdateSchema.safeParse(body);

  if (!parsedBody.success) {
    return NextResponse.json<ACPError>(
      {
        type: "invalid_request",
        code: "request_not_idempotent",
        message: parsedBody.error.errors[0].message,
        param: parsedBody.error.errors[0].path.join("."),
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

  return NextResponse.json(result.data);
}
