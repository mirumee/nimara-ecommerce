import { type UcpDiscoveryProfile } from "@ucp-js/sdk";

import { UCP_VERSION } from "./consts";

export const getDiscoveryProfile = () => {
  return {
    ucp: {
      version: UCP_VERSION,
      services: {},
      capabilities: [],
    },
    payment: {
      handlers: [],
    },
  } satisfies UcpDiscoveryProfile;
};
