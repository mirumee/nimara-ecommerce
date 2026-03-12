import {
  type BuyerClass,
  type CheckoutResponse,
  type CheckoutResponseStatus,
  type CheckoutWithFulfillmentResponse,
  type FulfillmentRequest,
  type LineItemResponse,
  type MethodElement,
  type OrderClass,
  type PostalAddress,
  type TotalResponse,
} from "@ucp-js/sdk";

import { UCP_VERSION } from "#root/ucp/consts";
import {
  calculateFulfillmentDate,
  formatDeliveryDays,
  toMinorCurrency,
} from "#root/ucp/saleor/helpers";

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
  fulfillment?: FulfillmentRequest;
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
  checkout: Pick<
    SaleorCheckout,
    "subtotalPrice" | "totalPrice" | "shippingPrice"
  >,
): TotalResponse[] => {
  const subtotal = checkout.subtotalPrice.gross.amount;
  const total = checkout.totalPrice.gross.amount;
  const shipping = checkout.shippingPrice.gross.amount;
  const tax = total - subtotal;

  const currency = checkout.totalPrice.gross.currency;

  return [
    {
      type: "fulfillment",
      amount: toMinorCurrency(shipping, currency),
    },
    {
      type: "subtotal",
      amount: toMinorCurrency(subtotal, currency),
    },
    {
      type: "tax",
      amount: toMinorCurrency(tax, currency),
    },
    {
      type: "total",
      amount: toMinorCurrency(total, currency),
    },
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

    const currency = line.undiscountedTotalPrice.currency;
    const subtotal = line.totalPrice.gross.amount;
    const tax = line.totalPrice.gross.amount - line.totalPrice.net.amount;
    const total = line.totalPrice.gross.amount;

    return {
      id: line.id,
      item: {
        id: line.variant.id,
        title: line.variant.name,
        price: toMinorCurrency(unitPrice, currency),
      },
      quantity: line.quantity,
      totals: [
        { type: "tax", amount: toMinorCurrency(tax, currency) },
        { type: "subtotal", amount: toMinorCurrency(subtotal, currency) },
        { type: "total", amount: toMinorCurrency(total, currency) },
      ],
    };
  });
};

/**
 * Converts Saleor checkout shipping address into a UCP fulfillment destination.
 */
const toFulfillmentDestination = (
  checkout: Pick<SaleorCheckout, "id" | "shippingAddress">,
): { address: PostalAddress; id: string } | null => {
  if (!checkout.shippingAddress) {
    return null;
  }

  const address: PostalAddress = {
    address_country: checkout.shippingAddress.country?.code,
    address_locality: checkout.shippingAddress.city,
    address_region: checkout.shippingAddress.countryArea || undefined,
    first_name: checkout.shippingAddress.firstName,
    last_name: checkout.shippingAddress.lastName,
    phone_number: checkout.shippingAddress.phone || undefined,
    postal_code: checkout.shippingAddress.postalCode,
    street_address: [
      checkout.shippingAddress.streetAddress1,
      checkout.shippingAddress.streetAddress2,
    ]
      .filter(Boolean)
      .join(", "),
  };

  return {
    id: `dest_${checkout.id}`,
    address,
  };
};

/**
 * Converts Saleor shipping methods into UCP fulfillment method with groups and options.
 * Maps each ShippingMethod as an option within a single fulfillment group.
 * Note: SDK FulfillmentRequest type is limited for request validation,
 * but response includes full options. We cast to unknown to bypass strict typing.
 */
const toFulfillmentMethod = (
  checkout: Pick<
    SaleorCheckout,
    | "id"
    | "lines"
    | "shippingMethods"
    | "shippingAddress"
    | "deliveryMethod"
    | "shippingPrice"
  >,
): MethodElement | null => {
  if (!checkout.shippingAddress || checkout.shippingMethods.length === 0) {
    return null;
  }

  const destination = toFulfillmentDestination(checkout);

  if (!destination) {
    return null;
  }

  const lineItemIds = checkout.lines.map((line) => line.id);
  const currency = checkout.shippingPrice.gross.currency;

  const destinationWithId = {
    ...destination.address,
    id: destination.id,
  };

  return {
    id: `method_shipping_${checkout.id}`,
    type: "shipping" as const,
    line_item_ids: lineItemIds,
    destinations: [destinationWithId],
    selected_destination_id: destination.id,
    groups: [
      {
        id: `group_1_${checkout.id}`,
        line_item_ids: lineItemIds,
        options: checkout.shippingMethods.map((method) => ({
          id: method.id,
          title: method.name,
          description:
            method.message ||
            formatDeliveryDays(
              method.minimumDeliveryDays,
              method.maximumDeliveryDays,
            ),
          earliest_fulfillment_time:
            method.minimumDeliveryDays !== null
              ? calculateFulfillmentDate(method.minimumDeliveryDays)
              : undefined,
          latest_fulfillment_time:
            method.maximumDeliveryDays !== null
              ? calculateFulfillmentDate(method.maximumDeliveryDays)
              : undefined,
          totals: [
            {
              type: "fulfillment" as const,
              display_text: "Shipping",
              amount: toMinorCurrency(method.price.amount, currency),
            },
          ],
        })),
        selected_option_id:
          (checkout.deliveryMethod as { id?: string } | null)?.id || null,
      },
    ],
  } as unknown as MethodElement;
};

/**
 * Converts Saleor checkout details into an internal UCP checkout session model.
 */
export const toUCPCheckoutSession = (
  checkout: SaleorCheckout,
  order?: { id: string; permalinkUrl: string },
): UCPCheckoutSessionModel => {
  const fulfillmentMethod = toFulfillmentMethod(checkout);

  return {
    id: checkout.id,
    status: getCheckoutStatus(checkout),
    currency: checkout.totalPrice.gross.currency,
    lineItems: toUCPLineItems(checkout.lines),
    totals: calculateTotals(checkout),
    buyer: normalizeBuyer(checkout.buyer),
    fulfillmentAddress: toUCPAddress(checkout.shippingAddress),
    fulfillment: fulfillmentMethod
      ? {
          methods: [fulfillmentMethod],
        }
      : undefined,
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
): CheckoutWithFulfillmentResponse => ({
  fulfillment: (session.fulfillment || {
    methods: [],
  }) as unknown as CheckoutWithFulfillmentResponse["fulfillment"],
  id: session.id,
  status: session.status,
  currency: session.currency,
  buyer: session.buyer,
  line_items: session.lineItems.map((item) => ({
    id: item.id,
    item: {
      id: item.item.id,
      price: toMinorCurrency(item.item.price, session.currency),
      title: item.item.title,
    },
    quantity: item.quantity,
    totals: item.totals.map((total) => ({
      type: total.type,
      amount: toMinorCurrency(total.amount, session.currency),
    })),
  })) as unknown as CheckoutResponse["line_items"],
  totals: session.totals.map((total) => ({
    type: total.type,
    amount: toMinorCurrency(total.amount, session.currency),
  })) as unknown as TotalResponse[],
  ucp: {
    version: UCP_VERSION,
    capabilities: [{ name: "dev.ucp.shopping.checkout", version: UCP_VERSION }],
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
});
