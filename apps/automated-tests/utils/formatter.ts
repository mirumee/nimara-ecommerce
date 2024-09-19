export const formatAsPrice = ({
  locale = "en-GB",
  amount,
  currency,
  minimumFractionDigits = 0,
}: {
  amount: number;
  currency: string;
  locale?: string;
  minimumFractionDigits?: number;
}) =>
  new Intl.NumberFormat(locale, {
    style: "currency",
    currencyDisplay: "narrowSymbol",
    minimumFractionDigits,
    currency,
  }).format(amount);
