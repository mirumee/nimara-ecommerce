import { UCP_VERSION } from "../config";
import { type UcpCapabilityRegistry } from "./negotiation";

export const UCP_ROOT_CAPABILITIES = {
  cart: "dev.ucp.shopping.cart",
  catalogLookup: "dev.ucp.shopping.catalog.lookup",
  catalogSearch: "dev.ucp.shopping.catalog.search",
  checkout: "dev.ucp.shopping.checkout",
  order: "dev.ucp.shopping.order",
} as const;

function includesCapabilityExtensionForRoot({
  entryExtends,
  rootCapability,
}: {
  entryExtends?: string | string[];
  rootCapability: string;
}): boolean {
  if (!entryExtends) {
    return false;
  }

  if (Array.isArray(entryExtends)) {
    return entryExtends.includes(rootCapability);
  }

  return entryExtends === rootCapability;
}

export function getResponseCapabilities({
  negotiatedCapabilities,
  rootCapability,
}: {
  negotiatedCapabilities?: UcpCapabilityRegistry;
  rootCapability: string;
}): UcpCapabilityRegistry {
  if (!negotiatedCapabilities) {
    return {};
  }

  const responseCapabilities: UcpCapabilityRegistry = {};

  for (const [capabilityName, entries] of Object.entries(
    negotiatedCapabilities,
  )) {
    const capabilityEntry = entries[0];
    const isRootCapability = capabilityName === rootCapability;
    const isExtensionForRoot = includesCapabilityExtensionForRoot({
      entryExtends: capabilityEntry?.extends,
      rootCapability,
    });

    if (isRootCapability || isExtensionForRoot) {
      responseCapabilities[capabilityName] = entries;
    }
  }

  return responseCapabilities;
}

export function withUcpSuccessMetadata<
  TPayload extends Record<string, unknown>,
>({
  capabilities,
  includePaymentHandlers = false,
  payload,
}: {
  capabilities: UcpCapabilityRegistry;
  includePaymentHandlers?: boolean;
  payload: TPayload;
}): TPayload {
  const existingUcp =
    typeof payload.ucp === "object" && payload.ucp !== null
      ? (payload.ucp as Record<string, unknown>)
      : {};

  const ucp = {
    ...existingUcp,
    version: UCP_VERSION,
    status: "success",
    capabilities,
    ...(includePaymentHandlers
      ? {
          payment_handlers:
            typeof existingUcp.payment_handlers === "object" &&
            existingUcp.payment_handlers !== null
              ? existingUcp.payment_handlers
              : {},
        }
      : {}),
  };

  return {
    ...payload,
    ucp,
  };
}

export function toUcpErrorResponseBody({
  capabilities,
  continueUrl,
  includePaymentHandlers = false,
  messages,
  status,
}: {
  capabilities: UcpCapabilityRegistry;
  continueUrl?: string;
  includePaymentHandlers?: boolean;
  messages: unknown[];
  status: string;
}) {
  return {
    ucp: {
      version: UCP_VERSION,
      status: "error",
      capabilities,
      ...(includePaymentHandlers ? { payment_handlers: {} } : {}),
    },
    messages,
    status,
    ...(continueUrl ? { continue_url: continueUrl } : {}),
  };
}
