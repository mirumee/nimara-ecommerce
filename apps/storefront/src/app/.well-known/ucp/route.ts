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
      handlers: [
        {
          id: "google_pay",
          name: "Google Pay",
          version: UCP_VERSION,
          spec: `https://pay.google.com/gp/p/ucp/${UCP_VERSION}/`,
          config_schema: `https://pay.google.com/gp/p/ucp/${UCP_VERSION}/schemas/config.json`,
          instrument_schemas: [
            `https://pay.google.com/gp/p/ucp/${UCP_VERSION}/schemas/card_payment_instrument.json`,
          ],
          config: {
            api_version: 2,
            api_version_minor: 0,
            environment: process.env.NEXT_PUBLIC_GOOGLE_PAY_ENV,
            merchant_info: {
              merchant_name: process.env.NEXT_PUBLIC_GOOGLE_PAY_MERCHANT_NAME,
              merchant_id: process.env.NEXT_PUBLIC_GOOGLE_PAY_MERCHANT_ID,
              merchant_origin:
                process.env.NEXT_PUBLIC_GOOGLE_PAY_MERCHANT_ORIGIN,
              auth_jwt: process.env.NEXT_PUBLIC_GOOGLE_PAY_AUTH_JWT,
            },
            allowed_payment_methods: [
              {
                type: "CARD",
                parameters: {
                  allowed_auth_methods: ["PAN_ONLY", "CRYPTOGRAM_3DS"],
                  allowed_card_networks: ["VISA", "MASTERCARD"],
                },
                tokenization_specification: {
                  type: "PAYMENT_GATEWAY",
                  parameters: {
                    gateway: process.env.NEXT_PUBLIC_GOOGLE_PAY_GATEWAY,
                    gatewayMerchantId:
                      process.env.NEXT_PUBLIC_GOOGLE_PAY_GATEWAY_MERCHANT_ID,
                  },
                },
              },
            ],
          },
        },
      ],
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
