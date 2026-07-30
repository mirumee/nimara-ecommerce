import {
  listStoredPaymentMethodsSchema,
  type PaymentMethodTokenizationDataSchema,
  paymentMethodTokenizationDataSchema,
  type PaymentMethodTokenizationSchema,
  paymentMethodTokenizationSchema,
  type StoredPaymentMethodDeleteSchema,
  storedPaymentMethodDeleteSchema,
  type StoredPaymentMethodSchema,
} from "./schema";

/**
 * The tokenization payload travels from the storefront through Saleor
 * untouched, so it is narrowed to the keys the app acts on and never passed
 * to Stripe as-is.
 */
export const parseTokenizationData = (
  data: unknown,
): PaymentMethodTokenizationDataSchema => {
  const result = paymentMethodTokenizationDataSchema.safeParse(data ?? {});

  return result.success ? result.data : {};
};

export const tokenizationResponse = (data: PaymentMethodTokenizationSchema) =>
  Response.json(paymentMethodTokenizationSchema.parse(data));

export const listResponse = (paymentMethods: StoredPaymentMethodSchema[] = []) =>
  Response.json(listStoredPaymentMethodsSchema.parse({ paymentMethods }));

export const deleteResponse = (data: StoredPaymentMethodDeleteSchema) =>
  Response.json(storedPaymentMethodDeleteSchema.parse(data));
