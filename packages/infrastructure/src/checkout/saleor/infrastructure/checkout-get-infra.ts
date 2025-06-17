import {
  type CountryCode,
  type LanguageCodeEnum,
} from "@nimara/codegen/schema";
import { type Checkout } from "@nimara/domain/objects/Checkout";
import { type TaxedMoney } from "@nimara/domain/objects/common";
import { err, ok } from "@nimara/domain/objects/Result";

import { serializeAddress } from "#root/address/saleor/serializers";
import { serializeCheckoutProblems } from "#root/checkout/saleor/serializers";
import { THUMBNAIL_FORMAT, THUMBNAIL_SIZE_SMALL } from "#root/config";
import { graphqlClient } from "#root/graphql/client";
import {
  serializeMoney,
  serializeTaxedMoney,
} from "#root/store/saleor/serializers";
import { serializeLine } from "#root/utils";

import {
  type CheckoutGetInfra,
  type SaleorCheckoutServiceConfig,
} from "../../types";
import { type CheckoutFragment } from "../graphql/fragments/generated";
import { CheckoutFindQueryDocument } from "../graphql/queries/generated";

// Saleor returns discount amount included in subtotal price
const calculateSubtotalPrice = (checkout: CheckoutFragment): TaxedMoney => {
  if (checkout?.discount) {
    return {
      gross: serializeMoney({
        currency: checkout.subtotalPrice.gross.currency,
        amount: checkout.subtotalPrice.gross.amount + checkout.discount.amount,
      }),
      net: serializeMoney({
        currency: checkout.subtotalPrice.net.currency,
        amount: checkout.subtotalPrice.net.amount + checkout.discount.amount,
      }),
      tax: serializeMoney({
        currency: checkout.subtotalPrice.tax.currency,
        amount: checkout.subtotalPrice.tax.amount,
      }),
    };
  }

  return serializeTaxedMoney(checkout.subtotalPrice);
};

const serializeCheckout = (checkout: CheckoutFragment): Checkout => {
  const priceType = checkout.displayGrossPrices ? "gross" : "net";

  return {
    ...checkout,
    billingAddress: checkout.billingAddress
      ? serializeAddress(checkout.billingAddress)
      : null,
    shippingAddress: checkout.shippingAddress
      ? serializeAddress(checkout.shippingAddress)
      : null,
    discount: checkout.discount ? serializeMoney(checkout.discount) : null,
    shippingPrice: serializeTaxedMoney(checkout.shippingPrice),
    shippingMethods: checkout.shippingMethods.map((method) => ({
      ...method,
      price: serializeMoney(method.price),
    })),
    totalPrice: serializeTaxedMoney(checkout.totalPrice),
    problems: serializeCheckoutProblems(checkout.problems, priceType),
    subtotalPrice: calculateSubtotalPrice(checkout),
    lines: checkout.lines.map((line) => serializeLine(line, priceType)),
  };
};

export const saleorCheckoutGetInfra =
  ({ apiURL, logger }: SaleorCheckoutServiceConfig): CheckoutGetInfra =>
  async ({ checkoutId, languageCode, countryCode }) => {
    const result = await graphqlClient(apiURL).execute(
      CheckoutFindQueryDocument,
      {
        variables: {
          checkoutId,
          languageCode: languageCode as LanguageCodeEnum,
          countryCode: countryCode as CountryCode,
          thumbnailFormat: THUMBNAIL_FORMAT,
          thumbnailSize: THUMBNAIL_SIZE_SMALL,
        },
        operationName: "CheckoutFindQuery",
      },
    );

    if (!result.ok) {
      logger.error("Failed to get checkout", {
        error: result.errors,
        checkoutId,
      });

      return result;
    }

    if (!result.data.checkout) {
      logger.error("Checkout not found", {
        checkoutId,
      });

      return err([
        {
          code: "CHECKOUT_NOT_FOUND_ERROR",
        },
      ]);
    }

    return ok({
      checkout: serializeCheckout(result.data.checkout),
    });
  };
