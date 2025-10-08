import { type CheckoutSessionFragment } from "#root/mcp/saleor/graphql/fragments/generated";
import { type CheckoutSession, checkoutSessionSchema } from "#root/mcp/schema";

import { type ProductFeedItem } from "../schema";
import { type ProductFeedFragment } from "./graphql/fragments/generated";

export const validateAndSerializeCheckout = (
  checkout: CheckoutSessionFragment,
): CheckoutSession | null => {
  try {
    const parsedCheckout = checkoutSessionSchema.safeParse({
      id: checkout.id,
      currency: checkout.totalPrice.currency.toLowerCase(),
      fulfillment_options: [],
      line_items: checkout.lines.map((line) => ({
        id: line.id,
        quantity: line.quantity,
      })),
      messages: [],
      status: "not_ready_for_payment",
      totals: [],
      buyer: checkout.user
        ? {
            email: checkout.user.email,
            first_name: checkout.user.firstName ?? "MISSING_FIRST_NAME",
            last_name: checkout.user.lastName ?? "MISSING_LAST_NAME",
            phone_number: "MISSING_PHONE",
          }
        : null,
    } satisfies CheckoutSession);

    if (!parsedCheckout.success) {
      console.error("Failed to parse checkout", {
        errors: parsedCheckout.error.errors,
        checkout,
      });

      return null;
    }

    return parsedCheckout.data;
  } catch (e) {
    console.error("Failed to parse checkout", { error: e });

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
