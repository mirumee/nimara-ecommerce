import { NextResponse } from "next/server";

import { UcpDiscoveryProfile } from "@ucp-js/sdk";

import { assert } from "node:console";

const UCP_VERSION = process.env.NEXT_PUBLIC_UCP_VERSION || "2026-01-23";

function getGooglePayConfig(): Record<string, unknown> {
  if (process.env.NEXT_PUBLIC_GOOGLE_PAY_CONFIG) {
    try {
      return JSON.parse(process.env.NEXT_PUBLIC_GOOGLE_PAY_CONFIG);
    } catch {
      console.warn("Failed to parse NEXT_PUBLIC_GOOGLE_PAY_CONFIG");
    }
  }

  assert(
    process.env.NEXT_PUBLIC_GOOGLE_PAY_ENV,
    "NEXT_PUBLIC_GOOGLE_PAY_ENV is required",
  );
  assert(
    process.env.NEXT_PUBLIC_GOOGLE_PAY_MERCHANT_NAME,
    "NEXT_PUBLIC_GOOGLE_PAY_MERCHANT_NAME is required",
  );
  assert(
    process.env.NEXT_PUBLIC_GOOGLE_PAY_MERCHANT_ID,
    "NEXT_PUBLIC_GOOGLE_PAY_MERCHANT_ID is required",
  );
  assert(
    process.env.NEXT_PUBLIC_GOOGLE_PAY_MERCHANT_ORIGIN,
    "NEXT_PUBLIC_GOOGLE_PAY_MERCHANT_ORIGIN is required",
  );
  assert(
    process.env.NEXT_PUBLIC_GOOGLE_PAY_AUTH_JWT,
    "NEXT_PUBLIC_GOOGLE_PAY_AUTH_JWT is required",
  );
  assert(
    process.env.NEXT_PUBLIC_GOOGLE_PAY_GATEWAY,
    "NEXT_PUBLIC_GOOGLE_PAY_GATEWAY is required",
  );
  assert(
    process.env.NEXT_PUBLIC_GOOGLE_PAY_GATEWAY_MERCHANT_ID,
    "NEXT_PUBLIC_GOOGLE_PAY_GATEWAY_MERCHANT_ID is required",
  );

  return {
    api_version: 2,
    api_version_minor: 0,
    environment: process.env.NEXT_PUBLIC_GOOGLE_PAY_ENV,
    merchant_info: {
      merchant_name: process.env.NEXT_PUBLIC_GOOGLE_PAY_MERCHANT_NAME,
      merchant_id: process.env.NEXT_PUBLIC_GOOGLE_PAY_MERCHANT_ID,
      merchant_origin: process.env.NEXT_PUBLIC_GOOGLE_PAY_MERCHANT_ORIGIN,
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
  };
}

function ucpDiscoveryProfile(): UcpDiscoveryProfile {
  return {
    ucp: {
      version: UCP_VERSION,
      capabilities: [
        {
          name: "dev.ucp.shopping.checkout",
          spec: "https://ucp.dev/specs/checkout",
          version: UCP_VERSION,
          schema: "https://ucp.dev/schemas/shopping/checkout.json",
        },
        {
          name: "dev.ucp.shopping.order",
          spec: "https://ucp.dev/specs/order",
          version: UCP_VERSION,
          schema: "https://ucp.dev/schemas/shopping/order.json",
        },
      ],
      services: {
        "dev.ucp.shopping.checkout": {
          spec: "https://ucp.dev/specs/checkout",
          version: UCP_VERSION,
          rest: {
            schema: "https://ucp.dev/schemas/shopping/checkout.json",
            endpoint: new URL(
              "/api/acp/checkout_sessions",
              process.env.NEXT_PUBLIC_STOREFRONT_URL,
            ).toString(),
          },
        },
      },
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
          config: getGooglePayConfig(),
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

export const dynamic = "force-dynamic";
