import {
  type BuyerClass,
  type CheckoutResponse,
  type CheckoutResponseStatus,
  type LineItemResponse,
  type OrderClass,
  type PostalAddress,
  type TotalResponse,
} from "@ucp-js/sdk";

import { UCP_VERSION } from "#root/ucp/consts";

import { type CheckoutSessionFragment } from "./graphql/fragments/generated";

type SaleorCheckout = CheckoutSessionFragment;

/**
 * Internal checkout session model bridging Saleor and UCP CheckoutResponse.
 * Uses SDK types where possible. Custom parts:
 * - order.permalinkUrl: camelCase internal; SDK OrderClass uses permalink_url (snake_case).
 */
export type UCPCheckoutSessionModel = {
  billingAddress?: PostalAddress;
  buyer?: BuyerClass;
  currency: string;
  fulfillmentAddress?: PostalAddress;
  id: string;
  lineItems: LineItemResponse[];
  order?: Pick<OrderClass, "id"> & {
    permalinkUrl: OrderClass["permalink_url"];
  };
  status: CheckoutResponseStatus;
  totals: TotalResponse[];
};

/**
 * Derives a UCP-compatible checkout status from Saleor checkout shape.
 */
const getCheckoutStatus = (
  checkout: Pick<
    SaleorCheckout,
    "authorizeStatus" | "billingAddress" | "shippingAddress" | "deliveryMethod"
  >,
): CheckoutResponseStatus => {
  if (checkout.authorizeStatus === "FULL") {
    return "completed";
  }

  const hasRequiredData =
    checkout.shippingAddress &&
    checkout.billingAddress &&
    checkout.deliveryMethod;

  return hasRequiredData ? "ready_for_complete" : "incomplete";
};

/**
 * Maps Saleor monetary summary into UCP totals sections.
 */
const calculateTotals = (
  checkout: Pick<SaleorCheckout, "subtotalPrice" | "totalPrice">,
): TotalResponse[] => {
  const subtotal = checkout.subtotalPrice.gross.amount;
  const total = checkout.totalPrice.gross.amount;
  const tax = total - subtotal;

  return [
    { type: "subtotal", amount: subtotal },
    { type: "tax", amount: tax },
    { type: "total", amount: total },
  ];
};

/**
 * Maps Saleor address to UCP address format.
 */
const toUCPAddress = (
  addr: {
    city: string;
    country: { code: string };
    countryArea: string;
    firstName: string;
    lastName: string;
    phone: string | null;
    postalCode: string;
    streetAddress1: string;
    streetAddress2?: string;
  } | null,
): PostalAddress | undefined => {
  if (!addr) {
    return undefined;
  }

  const street = [addr.streetAddress1, addr.streetAddress2]
    .filter(Boolean)
    .join(", ");

  return {
    address_country: addr.country?.code,
    address_locality: addr.city,
    address_region: addr.countryArea || undefined,
    first_name: addr.firstName,
    last_name: addr.lastName,
    phone_number: addr.phone || undefined,
    postal_code: addr.postalCode,
    street_address: street || undefined,
  };
};

/**
 * Parses buyer metadata JSON stored on checkout.
 */
const normalizeBuyer = (buyer: string | null): BuyerClass | undefined => {
  if (!buyer) {
    return undefined;
  }

  try {
    const parsed = JSON.parse(buyer) as {
      email?: string;
      first_name?: string;
      last_name?: string;
    };

    return {
      email: parsed.email,
      first_name: parsed.first_name,
      last_name: parsed.last_name,
    };
  } catch {
    return undefined;
  }
};

/**
 * Converts Saleor checkout lines into an internal UCP line item shape.
 */
const toUCPLineItems = (
  lines: SaleorCheckout["lines"],
): UCPCheckoutSessionModel["lineItems"] => {
  return lines.map((line) => {
    const unitPrice = line.quantity
      ? line.undiscountedTotalPrice.amount / line.quantity
      : 0;

    return {
      id: line.id,
      item: {
        id: line.variant.id,
        title: line.variant.name,
        price: unitPrice,
      },
      quantity: line.quantity,
      totals: [
        { type: "subtotal", amount: line.totalPrice.gross.amount },
        { type: "total", amount: line.totalPrice.gross.amount },
      ],
    };
  });
};

/**
 * Converts Saleor checkout details into an internal UCP checkout session model.
 */
export const toUCPCheckoutSession = (
  checkout: SaleorCheckout,
  order?: { id: string; permalinkUrl: string },
): UCPCheckoutSessionModel => {
  return {
    id: checkout.id,
    status: getCheckoutStatus(checkout),
    currency: checkout.totalPrice.gross.currency,
    lineItems: toUCPLineItems(checkout.lines),
    totals: calculateTotals(checkout),
    buyer: normalizeBuyer(checkout.buyer),
    fulfillmentAddress: toUCPAddress(checkout.shippingAddress),
    billingAddress: toUCPAddress(checkout.billingAddress),
    ...(order ? { order } : {}),
  };
};

/**
 * Builds UCP payment handlers from Saleor available gateways.
 */
export const toPaymentHandlers = (
  checkout: Pick<SaleorCheckout, "availablePaymentGateways">,
) => {
  return checkout.availablePaymentGateways.map((gateway) => ({
    id: gateway.id,
    name: gateway.name,
    version: UCP_VERSION,
    spec: "https://ucp.dev/specs/payment-handler",
    config_schema: "https://ucp.dev/schemas/payment-handler.json",
    instrument_schemas: [] as string[],
    config: Object.fromEntries(
      gateway.config.map((item) => [item.field, item.value]),
    ) as Record<string, string | null>,
  }));
};

/**
 * Converts internal UCP checkout model into SDK CheckoutResponse format.
 */
export const sessionToCheckoutResponse = (
  session: UCPCheckoutSessionModel,
  paymentHandlers: ReturnType<typeof toPaymentHandlers> = [],
): CheckoutResponse =>
  ({
    id: session.id,
    status: session.status,
    currency: session.currency,
    buyer: session.buyer,
    line_items: session.lineItems.map((item) => ({
      id: item.id,
      item: {
        id: item.item.id,
        price: item.item.price,
        title: item.item.title,
      },
      quantity: item.quantity,
      totals: item.totals.map((total) => ({
        type: total.type,
        amount: total.amount,
      })),
    })) as unknown as CheckoutResponse["line_items"],
    totals: session.totals.map((total) => ({
      type: total.type,
      amount: total.amount,
    })) as unknown as TotalResponse[],
    ucp: {
      version: UCP_VERSION,
      capabilities: [
        { name: "dev.ucp.shopping.checkout", version: UCP_VERSION },
      ],
    },
    payment: {
      handlers: paymentHandlers,
      instruments: [],
    } as unknown as CheckoutResponse["payment"],
    ...(session.order
      ? {
          order: {
            id: session.order.id,
            permalink_url: session.order.permalinkUrl,
          },
        }
      : {}),
    ...(session.fulfillmentAddress
      ? { fulfillment_address: session.fulfillmentAddress }
      : {}),
    ...(session.billingAddress
      ? { billing_address: session.billingAddress }
      : {}),
    links: [] as unknown as CheckoutResponse["links"],
  }) as CheckoutResponse;
