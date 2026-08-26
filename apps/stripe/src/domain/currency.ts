type Money = {
  amount: number;
  currency: string;
};

export const getDecimalsForStripe = (currency: string) => {
  if (currency.length !== 3) {
    throw new Error(`Currency ${currency} should be 3 characters long.`);
  }

  const map = {
    // https://docs.stripe.com/currencies#zero-decimal
    BIF: 0,
    CLP: 0,
    DJF: 0,
    GNF: 0,
    JPY: 0,
    KMF: 0,
    KRW: 0,
    MGA: 0,
    PYG: 0,
    RWF: 0,
    UGX: 0,
    VND: 0,
    VUV: 0,
    XAF: 0,
    XOF: 0,
    XPF: 0,

    BHD: 3,
    JOD: 3,
    KWD: 3,
    OMR: 3,
    TND: 3,
  };

  return map[currency as keyof typeof map] ?? 2;
};

export const getCentsFromAmount = (money: Money) => {
  const amount = parseFloat(money.amount.toString());
  const currency = money.currency;
  const decimals = getDecimalsForStripe(currency);
  const multiplier = 10 ** decimals;

  return Math.round(amount * multiplier);
};

export const getAmountFromCents = ({ amount, currency }: Money) => {
  const decimals = getDecimalsForStripe(currency);
  const multiplier = 10 ** decimals;

  return (amount / multiplier).toFixed(decimals);
};
