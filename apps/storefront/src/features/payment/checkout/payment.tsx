"use client";

import { type Maybe } from "@nimara/domain/objects/Maybe";
import { type PaymentMethod } from "@nimara/domain/objects/Payment";
import type { TransactionData } from "@nimara/infrastructure/payment/types";

import { clientEnvs } from "@/envs/client";
import { type MarketplaceCheckoutItem } from "@/features/checkout/types";

import { CheckoutPayment } from "./checkout-payment";
import { MarketplacePayment } from "./marketplace-payment";
import { type CommonPaymentProps } from "./types";

type PaymentProps = CommonPaymentProps & {
  initialTransactionData?: Maybe<TransactionData>;
  marketplaceCheckouts?: MarketplaceCheckoutItem[];
  paymentGatewayCustomer: Maybe<string>;
  paymentGatewayMethods: PaymentMethod[];
};

/**
 * Dispatches the payment step to its variant: marketplace payments run on
 * marketplace payment intents, standard checkouts on Saleor transactions.
 */
export const Payment = ({
  addressFormRows,
  checkout,
  countries,
  countryCode,
  errorCode,
  formattedAddresses,
  initialTransactionData,
  marketplaceCheckouts,
  paymentGatewayCustomer,
  paymentGatewayMethods,
  storeUrl,
  user,
}: PaymentProps) => {
  const isMarketplacePayment =
    clientEnvs.NEXT_PUBLIC_MARKETPLACE_ENABLED &&
    !!marketplaceCheckouts &&
    marketplaceCheckouts.length > 0;

  if (isMarketplacePayment) {
    return (
      <MarketplacePayment
        addressFormRows={addressFormRows}
        checkout={checkout}
        countries={countries}
        countryCode={countryCode}
        errorCode={errorCode}
        formattedAddresses={formattedAddresses}
        marketplaceCheckouts={marketplaceCheckouts}
        storeUrl={storeUrl}
        user={user}
      />
    );
  }

  return (
    <CheckoutPayment
      addressFormRows={addressFormRows}
      checkout={checkout}
      countries={countries}
      countryCode={countryCode}
      errorCode={errorCode}
      formattedAddresses={formattedAddresses}
      initialTransactionData={initialTransactionData}
      paymentGatewayCustomer={paymentGatewayCustomer}
      paymentGatewayMethods={paymentGatewayMethods}
      storeUrl={storeUrl}
      user={user}
    />
  );
};
