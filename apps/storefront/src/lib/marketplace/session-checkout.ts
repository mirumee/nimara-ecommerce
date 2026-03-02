import { type Checkout } from "@nimara/domain/objects/Checkout";
import { type TaxedMoney } from "@nimara/domain/objects/common";
import { type CheckoutService } from "@nimara/infrastructure/checkout/types";

import { serverEnvs } from "@/envs/server";
import { getMarketplaceCheckoutIds } from "@/lib/actions/cart";
import { type WithRegion } from "@/lib/types";

type CheckoutSource = {
  checkout: Checkout;
  checkoutId: string;
};

export type SessionCheckoutResult = {
  checkout: Checkout;
  checkoutIds: string[];
  checkouts: Checkout[];
  hasMixedCurrencies: boolean;
};

const sumTaxedMoney = (values: TaxedMoney[]): TaxedMoney => {
  const currency = values[0].gross.currency;

  return values.reduce<TaxedMoney>(
    (sum, current) => ({
      gross: {
        amount: sum.gross.amount + current.gross.amount,
        currency,
      },
      net: {
        amount: sum.net.amount + current.net.amount,
        currency,
      },
      tax: {
        amount: sum.tax.amount + current.tax.amount,
        currency,
      },
    }),
    {
      gross: { amount: 0, currency },
      net: { amount: 0, currency },
      tax: { amount: 0, currency },
    },
  );
};

export const aggregateMarketplaceCheckouts = (
  sources: CheckoutSource[],
): SessionCheckoutResult => {
  const checkoutIds = sources.map(({ checkoutId }) => checkoutId);
  const currencies = new Set(
    sources.flatMap(({ checkout }) => [
      checkout.totalPrice.gross.currency,
      checkout.subtotalPrice.gross.currency,
    ]),
  );

  const hasMixedCurrencies = currencies.size > 1;

  const lines = sources.flatMap(({ checkout, checkoutId }) =>
    checkout.lines.map((line) => ({
      ...line,
      sourceCheckoutId: checkoutId,
    })),
  );

  const insufficientStock = sources.flatMap(({ checkout, checkoutId }) =>
    checkout.problems.insufficientStock.map((problem) => ({
      ...problem,
      line: {
        ...problem.line,
        sourceCheckoutId: checkoutId,
      },
    })),
  );

  const variantNotAvailable = sources.flatMap(({ checkout, checkoutId }) =>
    checkout.problems.variantNotAvailable.map((problem) => ({
      ...problem,
      line: {
        ...problem.line,
        sourceCheckoutId: checkoutId,
      },
    })),
  );

  const firstCheckout = sources[0].checkout;

  return {
    checkouts: sources.map(({ checkout }) => checkout),
    checkoutIds,
    hasMixedCurrencies,
    checkout: {
      ...firstCheckout,
      id: checkoutIds[0],
      lines,
      subtotalPrice: sumTaxedMoney(
        sources.map(({ checkout }) => checkout.subtotalPrice),
      ),
      shippingPrice: sumTaxedMoney(
        sources.map(({ checkout }) => checkout.shippingPrice),
      ),
      totalPrice: sumTaxedMoney(
        sources.map(({ checkout }) => checkout.totalPrice),
      ),
      discount: null,
      voucherCode: null,
      isShippingRequired: sources.some(
        ({ checkout }) => checkout.isShippingRequired,
      ),
      problems: {
        insufficientStock,
        variantNotAvailable,
      },
      deliveryMethod: null,
      shippingMethods: [],
    },
  };
};

export const getMarketplaceSessionCheckouts = async ({
  checkoutService,
  region,
}: {
  checkoutService: CheckoutService;
  region: WithRegion["region"];
}): Promise<SessionCheckoutResult | null> => {
  if (!serverEnvs.MARKETPLACE_MODE) {
    return null;
  }

  const checkoutIds = await getMarketplaceCheckoutIds();

  if (!checkoutIds.length) {
    return null;
  }

  const settled = await Promise.allSettled(
    checkoutIds.map(async (checkoutId) => {
      const result = await checkoutService.checkoutGet({
        checkoutId,
        languageCode: region.language.code,
        countryCode: region.market.countryCode,
      });

      if (!result.ok) {
        return null;
      }

      return {
        checkoutId,
        checkout: result.data.checkout,
      };
    }),
  );

  const sources = settled
    .filter(
      (entry): entry is PromiseFulfilledResult<CheckoutSource | null> =>
        entry.status === "fulfilled" && !!entry.value,
    )
    .map(({ value }) => value)
    .filter((value): value is CheckoutSource => !!value);

  if (!sources.length) {
    return null;
  }

  return aggregateMarketplaceCheckouts(sources);
};
