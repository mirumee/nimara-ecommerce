import { type DeepNonNullable, type DeepRequired } from "ts-essentials";

import { type AllCurrency } from "@nimara/domain/consts";
import { type Price, type TaxedMoney } from "@nimara/domain/objects/common";
import { type Product } from "@nimara/domain/objects/Product";

import { type MoneyFragment } from "#root/graphql/fragments/generated";
import { getTranslation } from "#root/lib/saleor";
import { parseAttributeData } from "#root/lib/serializers/attribute";
import {
  type ProductDetailsFragment,
  type TaxedMoneyFragment,
} from "#root/store/saleor/graphql/fragments/generated";

export const serializeMoney = (data: MoneyFragment): Price => ({
  amount: data.amount,
  currency: data.currency as AllCurrency,
});

export const serializeTaxedMoney = (data: TaxedMoneyFragment): TaxedMoney => ({
  gross: serializeMoney(data.gross),
  net: serializeMoney(data.net),
  tax: serializeMoney(data.tax),
});

/**
 * Serializes the product details from the GraphQL response to a Product object.
 * @param data ProductDetailsFragment
 * @description Serializes the product details from the GraphQL response to a Product object.
 * @see {@link ProductDetailsFragment} for the structure of the data.
 * @see {@link Product} for the structure of the returned object.
 * @returns Product
 */
export const serializeProduct = (data: ProductDetailsFragment): Product => {
  const { id, media, variants } = data as DeepRequired<
    DeepNonNullable<ProductDetailsFragment>
  >;
  const name = getTranslation("name", data);
  const description = getTranslation("description", data);
  const images = media
    .filter(({ type }) => type === "IMAGE")
    .map(({ alt, url }) => ({ url, alt }));

  return {
    id,
    name,
    description,
    images,
    category: data.category,
    seo: {
      title: data.seoTitle ?? null,
      description: data.seoDescription ?? null,
    },
    attributes: data.attributes.map(parseAttributeData),
    variants: variants.map(
      ({
        nonSelectionAttributes,
        selectionAttributes,
        id,
        media,
        ...variant
      }) => {
        return {
          id,
          name: getTranslation("name", variant),
          selectionAttributes: selectionAttributes.map(parseAttributeData),
          nonSelectionAttributes:
            nonSelectionAttributes.map(parseAttributeData),
          images: media
            .filter(({ type }) => type === "IMAGE")
            .map(({ alt, url }) => ({ url, alt })),
        };
      },
    ),
  };
};
