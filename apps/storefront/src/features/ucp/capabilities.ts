import { type UcpDiscoveryProfile } from "@ucp-js/sdk";

import { UCP_VERSION } from "./config";

type UcpCapabilityDefinition = {
  extends?: string | string[];
  schema: string;
  spec: string;
  version: string;
};

/**
 * Single source of truth for UCP capabilities supported by the storefront.
 * Used directly in discovery profile and version negotiation.
 */
export const UCP_CAPABILITY_REGISTRY: Record<
  string,
  UcpCapabilityDefinition[]
> = {
  "dev.ucp.shopping.checkout": [
    {
      version: UCP_VERSION,
      spec: `https://ucp.dev/${UCP_VERSION}/specification/checkout/`,
      schema: `https://ucp.dev/${UCP_VERSION}/schemas/shopping/checkout.json`,
    },
  ],
  "dev.ucp.shopping.order": [
    {
      version: UCP_VERSION,
      spec: `https://ucp.dev/${UCP_VERSION}/specification/order/`,
      schema: `https://ucp.dev/${UCP_VERSION}/schemas/shopping/order.json`,
    },
  ],
  "dev.ucp.shopping.discount": [
    {
      version: UCP_VERSION,
      spec: `https://ucp.dev/${UCP_VERSION}/specification/discount/`,
      schema: `https://ucp.dev/${UCP_VERSION}/schemas/shopping/discount.json`,
      extends: "dev.ucp.shopping.checkout",
    },
  ],
  "dev.ucp.shopping.buyer_consent": [
    {
      version: UCP_VERSION,
      spec: `https://ucp.dev/${UCP_VERSION}/specification/buyer-consent/`,
      schema: `https://ucp.dev/${UCP_VERSION}/schemas/shopping/buyer_consent.json`,
      extends: "dev.ucp.shopping.checkout",
    },
  ],
  "dev.ucp.shopping.fulfillment": [
    {
      version: UCP_VERSION,
      spec: `https://ucp.dev/${UCP_VERSION}/specification/fulfillment/`,
      schema: `https://ucp.dev/${UCP_VERSION}/schemas/shopping/fulfillment.json`,
      extends: "dev.ucp.shopping.checkout",
    },
  ],
  "dev.ucp.shopping.cart": [
    {
      version: UCP_VERSION,
      spec: `https://ucp.dev/${UCP_VERSION}/specification/cart/`,
      schema: `https://ucp.dev/${UCP_VERSION}/schemas/shopping/cart.json`,
    },
  ],
  "dev.ucp.shopping.catalog.search": [
    {
      version: UCP_VERSION,
      spec: `https://ucp.dev/${UCP_VERSION}/specification/catalog/search/`,
      schema: `https://ucp.dev/${UCP_VERSION}/schemas/shopping/catalog_search.json`,
    },
  ],
  "dev.ucp.shopping.catalog.lookup": [
    {
      version: UCP_VERSION,
      spec: `https://ucp.dev/${UCP_VERSION}/specification/catalog/lookup/`,
      schema: `https://ucp.dev/${UCP_VERSION}/schemas/shopping/catalog_lookup.json`,
    },
  ],
};

/**
 * Derived array format for SDK consumers (serializers, service config).
 */
export const UCP_CAPABILITIES: UcpDiscoveryProfile["ucp"]["capabilities"] =
  Object.entries(UCP_CAPABILITY_REGISTRY).flatMap(([name, entries]) =>
    entries.map(({ extends: ext, ...entry }) => ({
      name,
      ...entry,
      ...(typeof ext === "string" ? { extends: ext } : {}),
    })),
  );
