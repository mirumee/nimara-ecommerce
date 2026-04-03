import {
  type BuyerClass,
  type BuyerWithConsentResponse,
  type CheckoutResponse,
  type CheckoutResponseStatus,
  type CheckoutWithFulfillmentResponse,
  type FulfillmentRequest,
  type LineItemResponse,
  type LinkElement,
  type MethodElement,
  type Order as UcpOrder,
  type OrderClass,
  type PostalAddress,
  type TotalResponse,
  type UcpDiscoveryProfile,
} from "@ucp-js/sdk";

import { UCP_VERSION } from "#root/ucp/consts";
import {
  calculateCheckoutExpiration,
  calculateFulfillmentDate,
  formatDeliveryDays,
  generateCheckoutLinks,
  generateContinueUrl,
  toMinorCurrency,
} from "#root/ucp/saleor/helpers";

import {
  type UcpCheckoutSessionFragment,
  type UcpOrderFragment,
} from "./graphql/fragments/generated";

/**
 * Applied discount entry in the UCP checkout session model.
 * Mirrors the UCP SDK DiscountsObject applied field shape.
 */
export type UCPAppliedDiscount = {
  amount: number;
  code?: string;
  title: string;
};

/**
 * Internal checkout session model bridging Saleor and UCP CheckoutResponse.
 * Uses SDK types where possible. Custom parts:
 * - order.permalinkUrl: camelCase internal; SDK OrderClass uses permalink_url (snake_case).
 * - continueUrl: For checkout handoff to business UI (will be converted to continue_url).
 * - expiresAtISO: ISO 8601 string for checkout expiration (will be converted to expires_at).
 * - messages: Error/warning messages array for error handling (Phase 2).
 * - discounts: Applied voucher codes and their discount amounts.
 */
export type UCPCheckoutSessionModel = {
  billingAddress?: PostalAddress;
  buyer?: BuyerClass;
  continueUrl?: string;
  currency: string;
  discounts?: {
    applied?: UCPAppliedDiscount[];
    codes?: string[];
  };
  expiresAtISO?: string;
  fulfillment?: FulfillmentRequest;
  fulfillmentAddress?: PostalAddress;
  id: string;
  lineItems: LineItemResponse[];
  links: LinkElement[];
  messages?: Array<{
    code: string;
    content: string;
    content_type?: "plain" | "markdown";
    path?: string;
    severity?: "recoverable" | "requires_buyer_input" | "requires_buyer_review";
    type: "error" | "warning" | "info";
  }>;
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
  checkout: UcpCheckoutSessionFragment,
): CheckoutResponseStatus => {
  if (checkout.authorizeStatus === "FULL") {
    return "completed";
  }

  const hasRequiredData =
    checkout.email !== null &&
    checkout.shippingAddress &&
    checkout.billingAddress &&
    checkout.deliveryMethod;

  return hasRequiredData ? "ready_for_complete" : "incomplete";
};

/**
 * Maps Saleor monetary summary into UCP totals sections.
 * Includes a "discount" entry when a voucher is applied.
 */
const calculateTotals = (
  checkout: Pick<
    UcpCheckoutSessionFragment,
    | "subtotalPrice"
    | "totalPrice"
    | "shippingPrice"
    | "discount"
    | "displayGrossPrices"
  >,
): TotalResponse[] => {
  const priceType = checkout.displayGrossPrices ? "gross" : "net";
  const currency = checkout.totalPrice[priceType].currency;

  // Calculate totals
  const subtotal = checkout.subtotalPrice[priceType].amount;
  const total = checkout.totalPrice[priceType].amount;
  const shipping = checkout.shippingPrice[priceType].amount;
  const tax = checkout.totalPrice.tax.amount;
  const discountAmount = checkout.discount?.amount ?? 0;

  const totals: TotalResponse[] = [
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

  if (discountAmount > 0) {
    totals.push({
      type: "discount",
      amount: toMinorCurrency(discountAmount, currency),
    } satisfies TotalResponse);
  }

  return totals;
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
const normalizeBuyer = (
  buyer: string | null,
): BuyerWithConsentResponse | undefined => {
  if (!buyer) {
    return undefined;
  }

  try {
    return JSON.parse(buyer) as BuyerWithConsentResponse;
  } catch {
    return undefined;
  }
};

/**
 * Converts Saleor checkout lines into an internal UCP line item shape.
 *
 * Saleor Money amounts are decimals (e.g., 12.99 for $12.99), so we convert
 * them to minor units (cents) using toMinorCurrency().
 */
const toUCPLineItems = (
  lines: UcpCheckoutSessionFragment["lines"],
): UCPCheckoutSessionModel["lineItems"] => {
  return lines.map((line) => {
    const unitPrice = line.quantity
      ? line.undiscountedTotalPrice.amount / line.quantity
      : 0;

    const currency = line.undiscountedTotalPrice.currency;
    const subtotal = line.totalPrice.gross.amount;
    const tax = line.totalPrice.tax.amount;
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
  checkout: Pick<UcpCheckoutSessionFragment, "id" | "shippingAddress">,
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
    UcpCheckoutSessionFragment,
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
 * Converts Saleor voucher/discount info into the UCP discounts shape.
 * Returns undefined when no voucher is applied.
 */
const toUCPDiscounts = (
  checkout: Pick<UcpCheckoutSessionFragment, "voucherCode" | "discount">,
): UCPCheckoutSessionModel["discounts"] => {
  if (!checkout.voucherCode) {
    return undefined;
  }

  const currency = checkout.discount?.currency ?? "USD";
  const discountAmount = checkout.discount?.amount ?? 0;

  return {
    codes: [checkout.voucherCode],
    ...(discountAmount > 0
      ? {
          applied: [
            {
              code: checkout.voucherCode,
              title: checkout.voucherCode,
              amount: toMinorCurrency(discountAmount, currency),
            },
          ],
        }
      : {}),
  };
};

/**
 * Converts Saleor checkout details into an internal UCP checkout session model.
 *
 * @param checkout - Saleor checkout fragment data
 * @param order - Optional order confirmation (id and permalink URL)
 * @param storefrontURL - Base URL for generating links and continue_url (required)
 * @param continueUrlConditions - Optional conditions to determine if continue_url is needed.
 *                                 Example: { missingEmail: checkout.email === null }
 *                                 If any condition is true, continue_url will be generated.
 */
export const toUCPCheckoutSession = (
  checkout: UcpCheckoutSessionFragment,
  storefrontURL: string,
  order?: { id: string; permalinkUrl: string },
  continueUrlConditions?: Record<string, boolean>,
): UCPCheckoutSessionModel => {
  const fulfillmentMethod = toFulfillmentMethod(checkout);
  const continueUrl = generateContinueUrl({
    checkoutId: checkout.id,
    storefrontURL,
    channelSlug: checkout.channel.slug,
    conditions: continueUrlConditions,
  });

  const discounts = toUCPDiscounts(checkout);

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
    links: generateCheckoutLinks(storefrontURL),
    expiresAtISO: calculateCheckoutExpiration(),
    ...(discounts ? { discounts } : {}),
    ...(continueUrl ? { continueUrl } : {}),
    ...(order ? { order } : {}),
  };
};

/**
 * Builds UCP payment handlers from Saleor available gateways.
 */
export const toPaymentHandlers = ({
  version,
  checkout,
}: {
  checkout: Pick<UcpCheckoutSessionFragment, "availablePaymentGateways">;
  version: string;
}) =>
  checkout.availablePaymentGateways.map((gateway) => ({
    id: gateway.id,
    name: gateway.name,
    version,
    spec: `https://ucp.dev/${version}/specification/payment-handler-guide/`,
    config_schema: "https://ucp.dev/schemas/payment-handler.json",
    instrument_schemas: [] as string[],
    config: Object.fromEntries(
      gateway.config.map((item) => [item.field, item.value]),
    ) as Record<string, string | null>,
  }));

/**
 * Converts internal UCP checkout model into SDK CheckoutResponse format.
 *
 * Note: Values in UCPCheckoutSessionModel are already in minor units,
 * so we pass them through directly without conversion.
 */
export const sessionToCheckoutResponse = ({
  version,
  session,
  capabilities,
  paymentHandlers,
}: {
  capabilities: UcpDiscoveryProfile["ucp"]["capabilities"];
  paymentHandlers: ReturnType<typeof toPaymentHandlers>;
  session: UCPCheckoutSessionModel;
  version: string;
}): CheckoutWithFulfillmentResponse => {
  const response = {
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
      version,
      capabilities,
    },
    payment: {
      handlers: paymentHandlers,
      instruments: [],
    } as unknown as CheckoutResponse["payment"],
    links: session.links as unknown as CheckoutResponse["links"],
    ...(session.discounts ? { discounts: session.discounts } : {}),
    ...(session.messages && session.messages.length > 0
      ? {
          messages: session.messages.map((msg) => ({
            type: msg.type,
            code: msg.code,
            content: msg.content,
            ...(msg.severity ? { severity: msg.severity } : {}),
            ...(msg.path ? { path: msg.path } : {}),
            ...(msg.content_type ? { content_type: msg.content_type } : {}),
          })),
        }
      : {}),
    ...(session.expiresAtISO
      ? { expires_at: new Date(session.expiresAtISO) }
      : {}),
    ...(session.continueUrl ? { continue_url: session.continueUrl } : {}),
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
  } satisfies CheckoutWithFulfillmentResponse;

  return {
    ...response,
  } satisfies CheckoutWithFulfillmentResponse;
};

export const orderToUCPOrder = ({
  order,
  capabilities = [],
  storefrontURL,
}: {
  capabilities: UcpDiscoveryProfile["ucp"]["capabilities"];
  order: UcpOrderFragment;
  storefrontURL: string;
}) => {
  const priceType = order.displayGrossPrices ? "gross" : "net";
  const currency = order.lines[0]?.totalPrice[priceType].currency || "USD";

  // Calculate totals from line items
  const subtotal = order.lines.reduce((sum, line) => {
    return sum + line.totalPrice[priceType].amount;
  }, 0);

  const permalinkUrl = new URL(
    `/order/confirmation/${order.id}`,
    storefrontURL,
  ).toString();

  return {
    id: order.id,
    checkout_id: order.checkoutId || "",
    permalink_url: permalinkUrl,
    line_items: order.lines.map((line) => ({
      id: line.id,
      quantity: {
        fulfilled: line.quantityFulfilled,
        total: line.quantity,
      },
      status:
        line.quantityFulfilled === line.quantity
          ? "fulfilled"
          : line.quantityFulfilled > 0
            ? "partial"
            : "processing",
      totals: [
        {
          type: "subtotal" as const,
          amount: toMinorCurrency(line.totalPrice[priceType].amount, currency),
        },
      ],
      item: {
        id: line.productVariantId || "",
        title: line.productName,
        price: toMinorCurrency(line.unitPrice[priceType].amount, currency),
      },
    })),
    fulfillment: {
      events: order.fulfillments.map((fulfillment) => ({
        type: fulfillment.status,
        id: fulfillment.id,
        line_items: order.lines.map((line) => ({
          id: line.id,
          quantity: line.quantityFulfilled,
        })),
        occurred_at: new Date(),
      })),
    },
    totals: [
      {
        type: "subtotal" as const,
        amount: toMinorCurrency(subtotal, currency),
      },
      {
        type: "total" as const,
        amount: toMinorCurrency(subtotal, currency),
      },
    ],
    ucp: {
      version: UCP_VERSION,
      capabilities,
    },
  } satisfies UcpOrder;
};
