import EditorJSHTML from "editorjs-html";
import { stripHtml } from "string-strip-html";

import {
  type Buyer,
  type CheckoutSession,
  checkoutSessionSchema,
  type CheckoutSessionStatus,
  type FulfillmentAddress,
  type ProductFeed,
  productFeedItemSchema,
  type Totals,
} from "#root/acp/schema";
import { type Logger } from "#root/logging/types";

import { type ProductFeedItem } from "../schema";
import {
  type CheckoutSessionFragment,
  type ProductFeedFragment,
} from "./graphql/fragments/generated";

export const validateAndSerializeCheckout = (
  checkout: CheckoutSessionFragment,
  extraContext: {
    logger?: Logger;
    storefrontUrl: string;
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

export function validateAndSerializeProducts(
  products: ProductFeedFragment[],
  extraContext: {
    channelPrefix: string;
    logger?: Logger;
    storefrontUrl: string;
  },
): ProductFeed {
  const { channelPrefix, logger, storefrontUrl } = extraContext;

  const getAttr = (
    attrs: ProductFeedFragment["attributes"],
    key: string,
  ): string | undefined =>
    attrs.find((a) => a.attribute.name?.toLowerCase() === key)?.values?.[0]
      ?.name ?? undefined;

  const productsFeedItems: ProductFeedItem[] = [];

  for (const product of products) {
    if (!product.variants || product.variants.length === 0) {
      continue;
    }

    const variantLink = new URL(
      `${channelPrefix}/products/${product.slug}`,
      storefrontUrl,
    ).toString();

    for (const variant of product.variants) {
      const parsedItem = productFeedItemSchema.safeParse({
        enable_search: true,
        enable_checkout: true,
        id: variant.sku ?? variant?.id,
        title: `${product.name}${
          variant.attributes?.length
            ? " - " +
              variant.attributes
                .map((a) => a.values?.[0]?.name)
                .filter(Boolean)
                .join(", ")
            : ""
        }`,
        description: parseDescription(product.description),
        link: variantLink,
        price: variant.pricing?.price?.gross?.amount ?? 0,
        currency: variant.pricing?.price?.gross?.currency ?? "",
        availability:
          (variant.quantityAvailable ?? 0) > 0 ? "in_stock" : "out_of_stock",
        inventory_quantity: variant.quantityAvailable ?? 0,
        image_link: product.media?.[0]?.url,
        additional_image_link: product.media?.slice(1).map((m) => m.url) ?? [],
        item_group_id: product.id,
        item_group_title: product.name,
        color: getAttr(variant.attributes, "color"),
        size: getAttr(variant.attributes, "size"),
        size_system: getAttr(variant.attributes, "size_system"),
        gender: getAttr(variant.attributes, "gender"),
        offer_id: variant.id,
        brand: getAttr(product.attributes, "brand"),
        material: getAttr(product.attributes, "material"),
        seller_name: "Nimara Storefront",
        seller_url: storefrontUrl,
      } satisfies ProductFeedItem);

      if (!parsedItem.success) {
        logger?.error("Failed to parse product feed item", {
          variantId: variant.id,
          errors: parsedItem.error.errors,
        });

        continue;
      }

      productsFeedItems.push(parsedItem.data);
    }
  }

  return productsFeedItems;
}

/**
 * Parses the description from Saleor and returns a plain text version.
 * @param description - description in JSON string format from Saleor
 * @returns plain text description
 */
export const parseDescription = (description: string | null | undefined) => {
  if (!description) {
    return "";
  }

  try {
    const desc = JSON.parse(description);

    const parsedHTML = EditorJSHTML().parse(desc).join(". ");
    const strippedHTML = stripHtml(parsedHTML);

    return strippedHTML.result;
  } catch {
    return "";
  }
};
