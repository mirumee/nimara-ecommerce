import { z } from "zod";

import { TOKENIZED_PAYMENT_FLOW } from "./const";

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

export type StoredPaymentMethodSchema = z.infer<
  typeof storedPaymentMethodSchema
>;

export const listStoredPaymentMethodsSchema = z.object({
  paymentMethods: z.array(storedPaymentMethodSchema),
});

export type ListStoredPaymentMethodsSchema = z.infer<
  typeof listStoredPaymentMethodsSchema
>;

export const STORED_PAYMENT_METHOD_REQUEST_DELETE_RESULT = [
  "FAILED_TO_DELETE",
  "FAILED_TO_DELIVER",
  "SUCCESSFULLY_DELETED",
] as const;

export const storedPaymentMethodDeleteSchema = z.object({
  error: z.string().optional(),
  result: z.enum(STORED_PAYMENT_METHOD_REQUEST_DELETE_RESULT),
});

export type StoredPaymentMethodDeleteSchema = z.infer<
  typeof storedPaymentMethodDeleteSchema
>;

export const paymentMethodTokenizationDataSchema = z.object({
  setAsDefault: z.boolean().optional(),
});

export type PaymentMethodTokenizationDataSchema = z.infer<
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

export type PaymentMethodTokenizationSchema = z.infer<
  typeof paymentMethodTokenizationSchema
>;
