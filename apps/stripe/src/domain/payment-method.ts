import { z } from "zod";

// Saleor's only supported tokenized-payment flow; saved cards are shopper-present.
export const TOKENIZED_PAYMENT_FLOW = ["INTERACTIVE"] as const;

const jsonObjectSchema = z.record(z.string(), z.unknown());

export const creditCardInfoSchema = z.object({
  brand: z.string(),
  expMonth: z.number().optional(),
  expYear: z.number().optional(),
  firstDigits: z.string().optional(),
  lastDigits: z.string(),
});

export const storedPaymentMethodSchema = z.object({
  creditCardInfo: creditCardInfoSchema.optional(),
  data: jsonObjectSchema.optional(),
  id: z.string(),
  name: z.string().optional(),
  supportedPaymentFlows: z.array(z.enum(TOKENIZED_PAYMENT_FLOW)),
  type: z.string(),
});

export type StoredPaymentMethod = z.infer<typeof storedPaymentMethodSchema>;

export const listStoredPaymentMethodsSchema = z.object({
  paymentMethods: z.array(storedPaymentMethodSchema),
});

export type ListStoredPaymentMethods = z.infer<
  typeof listStoredPaymentMethodsSchema
>;

export const STORED_PAYMENT_METHOD_DELETE_RESULT = [
  "FAILED_TO_DELETE",
  "FAILED_TO_DELIVER",
  "SUCCESSFULLY_DELETED",
] as const;

export const storedPaymentMethodDeleteSchema = z.object({
  error: z.string().optional(),
  result: z.enum(STORED_PAYMENT_METHOD_DELETE_RESULT),
});

export type StoredPaymentMethodDelete = z.infer<
  typeof storedPaymentMethodDeleteSchema
>;

export const paymentMethodTokenizationDataSchema = z.object({
  setAsDefault: z.boolean().optional(),
});

export type PaymentMethodTokenizationData = z.infer<
  typeof paymentMethodTokenizationDataSchema
>;

export const PAYMENT_METHOD_TOKENIZATION_RESULT = [
  "ADDITIONAL_ACTION_REQUIRED",
  "FAILED_TO_DELIVER",
  "FAILED_TO_TOKENIZE",
  "PENDING",
  "SUCCESSFULLY_TOKENIZED",
] as const;

export type PaymentMethodTokenizationResult =
  (typeof PAYMENT_METHOD_TOKENIZATION_RESULT)[number];

export const paymentMethodTokenizationSchema = z.object({
  data: jsonObjectSchema.optional(),
  error: z.string().optional(),
  id: z.string().optional(),
  result: z.enum(PAYMENT_METHOD_TOKENIZATION_RESULT),
});

export type PaymentMethodTokenization = z.infer<
  typeof paymentMethodTokenizationSchema
>;

export type PaymentMethodRepository = {
  /**
   * Two-phase create — the shopper confirms in the storefront between calls.
   * Without `finalizeData`: opens a session (client secret to confirm
   * against). With `finalizeData`: claims the confirmed session and yields
   * the payment method id.
   */
  create(opts: {
    finalizeData?: { data: unknown; sessionId: string };
    gatewayUserId: string;
    userId: string;
  }): Promise<PaymentMethodTokenization>;

  delete(opts: {
    gatewayUserId: string;
    paymentMethodId: string;
    userId: string;
  }): Promise<StoredPaymentMethodDelete>;

  list(opts: {
    gatewayUserId: string;
    userId: string;
  }): Promise<StoredPaymentMethod[]>;
};
