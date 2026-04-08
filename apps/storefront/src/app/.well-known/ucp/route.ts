import { NextResponse } from "next/server";

import { UcpDiscoveryProfile } from "@ucp-js/sdk";

import { UCP_VERSION, UCP_API_ENDPOINT } from "@/features/ucp/config";
import { UCP_CAPABILITIES } from "@/features/ucp/capabilities";

function ucpDiscoveryProfile(): UcpDiscoveryProfile {
  return {
    ucp: {
      version: UCP_VERSION,
      services: {
        "dev.ucp.shopping": {
          version: UCP_VERSION,
          spec: "https://ucp.dev/specification/reference",
          rest: {
            schema: `https://ucp.dev/${UCP_VERSION}/services/shopping/openapi.json`,
            endpoint: UCP_API_ENDPOINT,
          },
        },
      },
      capabilities: UCP_CAPABILITIES,
    },
    payment: {
      handlers: [],
    },
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
