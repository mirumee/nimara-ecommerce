import type { CountryCode, LanguageCodeEnum } from "@nimara/codegen/schema";
import type { Checkout } from "@nimara/domain/objects/Checkout";
import type { TaxedMoney } from "@nimara/domain/objects/common";
import type { BaseError } from "@nimara/domain/objects/Error";

import { graphqlClient } from "#root/graphql/client";
import {
  THUMBNAIL_FORMAT,
  THUMBNAIL_SIZE,
} from "#root/public/saleor/cart/config";
import { serializeLine } from "#root/utils";

import type { CheckoutFragment } from "../graphql/fragments/generated";
import { CheckoutFindQueryDocument } from "../graphql/queries/generated";
import type { CheckoutGetInfra, SaleorCheckoutServiceConfig } from "../types";

// Saleor returns discount amount included in subtotal price
const calculateSubtotalPrice = (checkout: CheckoutFragment): TaxedMoney => {
  if (checkout?.discount) {
    return {
      gross: {
        currency: checkout.subtotalPrice.gross.currency,
        amount: checkout.subtotalPrice.gross.amount + checkout.discount.amount,
      },
      net: {
        currency: checkout.subtotalPrice.net.currency,
        amount: checkout.subtotalPrice.net.amount + checkout.discount.amount,
      },
      tax: {
        currency: checkout.subtotalPrice.tax.currency,
        amount: checkout.subtotalPrice.tax.amount,
      },
    };
  }

  return checkout.subtotalPrice;
};

const serializeCheckout = (checkout: CheckoutFragment): Checkout => {
  const priceType = checkout.displayGrossPrices ? "gross" : "net";

  return {
    ...checkout,
    problems: {
      insufficientStock:
        checkout.problems
          ?.filter((p) => "availableQuantity" in p && p)
          ?.map((p) => ({
            ...p,
            line: serializeLine(p.line, priceType),
          })) ?? [],
    },
    subtotalPrice: calculateSubtotalPrice(checkout),
    lines: checkout.lines.map((line) => serializeLine(line, priceType)),
  };
};

export const saleorCheckoutGetInfra = ({
  apiURL,
}: SaleorCheckoutServiceConfig): CheckoutGetInfra => {
  return async ({ checkoutId, languageCode, countryCode }) => {
    const { data, error } = await graphqlClient(apiURL).execute(
      CheckoutFindQueryDocument,
      {
        variables: {
          checkoutId,
          languageCode: languageCode as LanguageCodeEnum,
          countryCode: countryCode as CountryCode,
          thumbnailFormat: THUMBNAIL_FORMAT,
          thumbnailSize: THUMBNAIL_SIZE,
        },
      },
    );

    if (error) {
      return {
        checkout: null,
        isSuccess: false,
        errors: [error as BaseError],
      };
    }
    if (!data) {
      // TODO: how to handle
      throw new Error("No data returned from Saleor");
    }

    return {
      isSuccess: true,
      checkout: serializeCheckout(data.checkout!),
    };
  };
};
