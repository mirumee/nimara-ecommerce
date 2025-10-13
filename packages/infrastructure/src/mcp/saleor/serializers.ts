import { Logger } from "#root/logging/types";
import {
  Buyer,
  type CheckoutSession,
  checkoutSessionSchema,
  type CheckoutSessionStatus,
  FulfillmentAddress,
  type Totals,
} from "#root/mcp/schema";

import { type ProductFeedItem } from "../schema";
import {
  type CheckoutSessionFragment,
  type ProductFeedFragment,
} from "./graphql/fragments/generated";

export const validateAndSerializeCheckout = (
  checkout: CheckoutSessionFragment,
  extraContext: {
    storefrontUrl: string;
    logger?: Logger;
  },
): CheckoutSession | null => {
  const { fulfillmentAddress } = checkout;
  const { storefrontUrl, logger } = extraContext;

  const getBuyerData = () => {
    const { buyer } = checkout;

    if (!buyer || buyer === "" || typeof buyer !== "string") {
      return null;
    }

    try {
      return JSON.parse(buyer) as Buyer;
    } catch {
      logger?.error("Failed to parse buyer", {
        buyer,
        checkoutId: checkout.id,
      });

      return null;
    }
  };

  const getFulfillmentAddress = () => {
    if (fulfillmentAddress && fulfillmentAddress !== "") {
      try {
        return JSON.parse(fulfillmentAddress) as FulfillmentAddress;
      } catch {
        logger?.error("Failed to parse fulfillment address", {
          fulfillmentAddress,
          checkoutId: checkout.id,
        });

        return null;
      }
    }

    return null;
  };

  const calculateTotals = () =>
    [
      {
        type: "items_base_amount",
        display_text: "Item(s) base amount",
        amount: checkout.subtotalPrice.gross.amount,
      },
      {
        type: "items_discount",
        display_text: "Item(s) discount",
        amount: checkout.discount?.amount ?? 0,
      },
      {
        type: "discount",
        display_text: "Discount",
        amount: checkout.discount?.amount ?? 0,
      },
      {
        type: "subtotal",
        display_text: "Subtotal",
        amount:
          checkout.subtotalPrice.gross.amount -
          (checkout.discount?.amount ?? 0),
      },
      {
        type: "tax",
        display_text: "Tax",
        amount:
          checkout.totalPrice.gross.amount -
          checkout.subtotalPrice.gross.amount,
      },
      {
        type: "total",
        display_text: "Total",
        amount: checkout.totalPrice.gross.amount,
      },
    ] satisfies Totals[];

  const determineCheckoutStatus = (): CheckoutSessionStatus => {
    if (checkout.authorizeStatus === "FULL") {
      return "completed";
    }

    const bothAddressesAreSet =
      checkout.shippingAddress && checkout.billingAddress;
    const shippingMethodIsSet = checkout.deliveryMethod !== null;

    const isCheckoutReadyForPayment =
      bothAddressesAreSet && shippingMethodIsSet;

    if (isCheckoutReadyForPayment) {
      return "ready_for_payment";
    }

    return "not_ready_for_payment";
  };

  try {
    const parsedCheckout = checkoutSessionSchema.safeParse({
      id: checkout.id,
      buyer: getBuyerData(),
      payment_provider: {
        provider: "stripe",
        supported_payment_methods: ["card"],
      },
      fulfillment_address: getFulfillmentAddress(),
      currency: checkout.totalPrice.gross.currency.toLowerCase(),
      fulfillment_options: checkout.shippingMethods.map((method) => ({
        type: "shipping",
        id: method.id,
        title: method.name,
        name:
          method.maximumDeliveryDays && method.minimumDeliveryDays
            ? `${method.name} (${method.minimumDeliveryDays}-${method.maximumDeliveryDays} days)`
            : method.name,
        carrier: method.name,
        subtotal: 0,
        tax: 0,
        total: method.price.amount,
      })),
      fulfillment_option_id: checkout.deliveryMethod?.id || null,
      line_items: checkout.lines.map((line) => ({
        id: line.id,
        item: {
          id: line.variant.id,
          quantity: line.quantity,
        },
        base_amount: line.totalPrice.net.amount,
        discount: 0,
        subtotal: line.totalPrice.net.amount,
        tax: line.totalPrice.gross.amount - line.totalPrice.net.amount,
        total: line.totalPrice.gross.amount,
      })),
      messages: [],
      status: determineCheckoutStatus(),
      totals: calculateTotals(),
      link: [
        {
          type: "terms_of_use",
          url: `${storefrontUrl}/terms-of-service`,
        },
        {
          type: "privacy_policy",
          url: `${storefrontUrl}/privacy-policy`,
        },
        {
          type: "seller_shop_policies",
          url: `${storefrontUrl}/return-policy`,
        },
      ],
    } satisfies CheckoutSession);

    if (!parsedCheckout.success) {
      logger?.error("Failed to parse checkout", {
        errors: parsedCheckout.error.errors.map(({ message, path }) => ({
          message,
          path: path.join("."),
        })),
        checkoutId: checkout.id,
      });

      return null;
    }

    return parsedCheckout.data;
  } catch (e) {
    logger?.error("Failed to parse checkout", { error: e });

    return null;
  }
};

export function serializeSaleorProductsToFeedItems(
  channel: string,
  storefrontUrl: string,
  products: ProductFeedFragment[],
): Array<ProductFeedItem> {
  const getAttr = (
    attrs:
      | {
          attribute: { name: string | null };
          values: { name: string | null }[];
        }[]
      | undefined,
    key: string,
  ): string | undefined =>
    attrs?.find((a) => a.attribute?.name?.toLowerCase() === key)?.values?.[0]
      ?.name ?? undefined;

  return products.flatMap((node) =>
    (node.variants ?? []).map((variant) => ({
      id: variant?.sku ?? variant?.id,
      title: `${node.name}${
        variant?.attributes?.length
          ? " - " +
            variant.attributes
              .map((a) => a.values?.[0]?.name)
              .filter(Boolean)
              .join(", ")
          : ""
      }`,
      description: node.description ?? "", // TODO: This should be a plain text not rich text from saleor
      link: `${storefrontUrl}/${channel}/products/${node.slug}`,
      price: variant?.pricing?.price?.gross?.amount ?? 0,
      currency: variant?.pricing?.price?.gross?.currency ?? "",
      availability:
        (variant?.quantityAvailable ?? 0) > 0 ? "in_stock" : "out_of_stock",
      inventory_quantity: variant?.quantityAvailable ?? 0,
      image_link: node.media?.[0]?.url ?? "",
      additional_image_link: node.media?.slice(1).map((m) => m.url) ?? [],
      item_group_id: node.id ?? "",
      item_group_title: node.name ?? "",
      color: getAttr(variant?.attributes, "color"),
      size: getAttr(variant?.attributes, "size"),
      size_system: getAttr(variant?.attributes, "size_system"),
      gender: getAttr(variant?.attributes, "gender"),
      offer_id: variant?.id ?? "",
      brand: getAttr(node.attributes, "brand"),
      material: getAttr(node.attributes, "material"),
      seller_name: "Nimara Store",
      seller_url: storefrontUrl,
    })),
  );
}
