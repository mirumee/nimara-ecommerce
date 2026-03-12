import { NextResponse } from "next/server";

import { UcpDiscoveryProfile } from "@ucp-js/sdk";

import { clientEnvs } from "@/envs/client";

const UCP_VERSION = "2026-01-23";
const UCP_API_ENDPOINT = new URL(
  `/api/ucp/${clientEnvs.NEXT_PUBLIC_DEFAULT_CHANNEL}`,
  clientEnvs.NEXT_PUBLIC_STOREFRONT_URL,
).toString();

function ucpDiscoveryProfile(): UcpDiscoveryProfile {
  return {
    ucp: {
      version: UCP_VERSION,
      services: {
        "dev.ucp.shopping": {
          version: UCP_VERSION,
          spec: "https://ucp.dev/specification/reference",
          rest: {
            schema: "https://ucp.dev/services/shopping/rest.openapi.json",
            endpoint: UCP_API_ENDPOINT,
          },
        },
      },
      capabilities: [
        {
          name: "dev.ucp.shopping.checkout",
          version: UCP_VERSION,
          spec: "https://ucp.dev/specification/checkout",
          schema: "https://ucp.dev/schemas/shopping/checkout.json",
        },
        {
          name: "dev.ucp.shopping.order",
          version: UCP_VERSION,
          spec: "https://ucp.dev/specification/order",
          schema: "https://ucp.dev/schemas/shopping/order.json",
        },
      ],
    },
    payment: {
      handlers: [
        {
          id: "gpay",
          name: "Google Pay",
          version: UCP_VERSION,
          spec: "https://pay.google.com/gp/p/ucp/2026-01-11/",
          config_schema:
            "https://pay.google.com/gp/p/ucp/2026-01-11/schemas/config.json",
          instrument_schemas: [
            "https://pay.google.com/gp/p/ucp/2026-01-11/schemas/card_payment_instrument.json",
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
