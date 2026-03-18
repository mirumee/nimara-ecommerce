import { type UcpDiscoveryProfile } from "@ucp-js/sdk";

import { UCP_VERSION } from "./config";

/**
 * List of UCP capabilities supported by the storefront.
 */
export const UCP_CAPABILITIES = [
  {
    name: "dev.ucp.shopping.checkout",
    version: UCP_VERSION,
    spec: `https://ucp.dev/${UCP_VERSION}/specification/checkout`,
    schema: `https://ucp.dev/${UCP_VERSION}/schemas/shopping/checkout.json`,
  },
  {
    name: "dev.ucp.shopping.order",
    version: UCP_VERSION,
    spec: `https://ucp.dev/${UCP_VERSION}/specification/order`,
    schema: `https://ucp.dev/${UCP_VERSION}/schemas/shopping/order.json`,
  },
] satisfies UcpDiscoveryProfile["ucp"]["capabilities"];
