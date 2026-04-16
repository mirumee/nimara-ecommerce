import { NextResponse } from "next/server";

import { UCP_VERSION, UCP_API_ENDPOINT } from "@/features/ucp/config";
import { UCP_CAPABILITY_REGISTRY } from "@/features/ucp/capabilities";

type UcpDiscoveryProfileV20260408 = {
  signing_keys: unknown[];
  ucp: {
    capabilities: Record<string, Array<Record<string, unknown>>>;
    payment_handlers: Record<string, Array<Record<string, unknown>>>;
    services: Record<string, Array<Record<string, unknown>>>;
    version: string;
  };
};

function ucpDiscoveryProfile(): UcpDiscoveryProfileV20260408 {
  return {
    ucp: {
      version: UCP_VERSION,
      services: {
        "dev.ucp.shopping": [
          {
            version: UCP_VERSION,
            spec: `https://ucp.dev/${UCP_VERSION}/specification/overview/`,
            transport: "rest",
            schema: `https://ucp.dev/${UCP_VERSION}/services/shopping/openapi.json`,
            endpoint: UCP_API_ENDPOINT,
          },
        ],
      },
      capabilities: UCP_CAPABILITY_REGISTRY,
      payment_handlers: {},
    },
    signing_keys: [],
  };
}

export async function GET() {
  const profile = ucpDiscoveryProfile();

  return NextResponse.json(profile, {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}

export const dynamic = "force-static";
