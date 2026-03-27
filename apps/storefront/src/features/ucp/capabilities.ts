import { type UcpDiscoveryProfile } from "@ucp-js/sdk";

import { UCP_VERSION } from "./config";

/**
 * List of UCP capabilities supported by the storefront.
 */
export const UCP_CAPABILITIES = [
  {
    name: "dev.ucp.shopping.checkout",
    version: UCP_VERSION,
    spec: `https://ucp.dev/${UCP_VERSION}/specification/checkout/`,
    schema: `https://ucp.dev/${UCP_VERSION}/schemas/shopping/checkout.json`,
  },
  {
    name: "dev.ucp.shopping.order",
    version: UCP_VERSION,
    spec: `https://ucp.dev/${UCP_VERSION}/specification/order/`,
    schema: `https://ucp.dev/${UCP_VERSION}/schemas/shopping/order.json`,
  },
  {
    name: "dev.ucp.shopping.discount",
    version: UCP_VERSION,
    spec: `https://ucp.dev/${UCP_VERSION}/specification/discount/`,
    schema: `https://ucp.dev/${UCP_VERSION}/schemas/shopping/discount.json`,
  },
  {
    name: "dev.ucp.shopping.buyer_consent",
    version: UCP_VERSION,
    spec: `https://ucp.dev/${UCP_VERSION}/specification/buyer-consent/`,
    schema: `https://ucp.dev/${UCP_VERSION}/schemas/shopping/buyer_consent.json`,
  },
  {
    name: "dev.ucp.shopping.fulfillment",
    version: UCP_VERSION,
    spec: `https://ucp.dev/${UCP_VERSION}/specification/fulfillment/`,
    schema: `https://ucp.dev/${UCP_VERSION}/schemas/shopping/fulfillment.json`,
  },
] satisfies UcpDiscoveryProfile["ucp"]["capabilities"];
