import { ProductFeedItem } from "../schema";
import { ProductsFeedQuery_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product } from "./graphql/queries/generated";

export function serializeSaleorProductsToFeedItems(
  channel: string,
  storefrontUrl: string,
  products: ProductsFeedQuery_products_ProductCountableConnection_edges_ProductCountableEdge_node_Product[],
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
