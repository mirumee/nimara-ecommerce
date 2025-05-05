import Stripe from "stripe";

import type {
  CreditCard,
  PaymentMethod,
  Paypal,
} from "@nimara/domain/objects/Payment";
import { ok } from "@nimara/domain/objects/Result";

import { API_VERSION } from "../../consts";
import type {
  PaymentMethodsListInfra,
  PaymentServiceConfig,
} from "../../types";

const serializeCreditCard = (data: Stripe.PaymentMethod.Card): CreditCard => ({
  last4: data.last4,
  expMonth: data.exp_month.toString(),
  expYear: data.exp_year.toString(),
  brand: data.brand,
});

const serializePaypal = (data: Stripe.PaymentMethod.Paypal): Paypal => ({
  email: data.payer_email ?? "",
});

const SERIALIZERS = {
  card: serializeCreditCard,
  paypal: serializePaypal,
};

const FETCH_LIMIT = 20;

export const paymentMethodsListInfra =
  ({ secretKey, logger }: PaymentServiceConfig): PaymentMethodsListInfra =>
  async ({ customerId }) => {
    const stripe = new Stripe(secretKey, { apiVersion: API_VERSION });

    const { data } = await stripe.customers.listPaymentMethods(customerId, {
      expand: ["data.customer.invoice_settings"],
      limit: FETCH_LIMIT,
    });

    const defaultPaymentMethod =
      (data?.[0]?.customer as Stripe.Customer)?.invoice_settings
        .default_payment_method ?? null;

    return ok(
      data
        .map(({ type, id, ...data }) => {
          if (type in SERIALIZERS && type in data) {
            return {
              id,
              type,
              isDefault: id === defaultPaymentMethod,
              paymentMethod: SERIALIZERS[type as keyof typeof SERIALIZERS](
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                (data as any)[type],
              ),
            };
          }

          logger.error("Unsupported payment method", { type });

          return null;
        })
        .filter(Boolean) as PaymentMethod[],
    );
  };
