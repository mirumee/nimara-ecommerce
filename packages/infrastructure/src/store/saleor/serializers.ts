import { type AllCurrency } from "@nimara/domain/consts";
import { type Price, type TaxedMoney } from "@nimara/domain/objects/common";

import { type MoneyFragment } from "#root/graphql/fragments/generated";
import { type TaxedMoneyFragment } from "#root/store/saleor/graphql/fragments/generated";

export const serializeMoney = (data: MoneyFragment): Price => ({
  amount: data.amount,
  currency: data.currency as AllCurrency,
});

export const serializeTaxedMoney = (data: TaxedMoneyFragment): TaxedMoney => ({
  gross: serializeMoney(data.gross),
  net: serializeMoney(data.net),
  tax: serializeMoney(data.tax),
});
