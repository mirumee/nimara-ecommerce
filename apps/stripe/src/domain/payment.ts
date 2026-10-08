import { z } from "zod";

import { TRANSACTION_EVENT_TYPE } from "./consts";

/**
 * https://docs.saleor.io/developer/extending/webhooks/synchronous-events/transaction
 */
export const transactionEventSchema = z.object({
  pspReference: z.string().nullable().optional(),
  result: z.enum(TRANSACTION_EVENT_TYPE).optional(),
  amount: z.string().optional(),
  created: z.string().nullable().optional(),
  data: z.object({}).loose().nullable().optional(),
  time: z.string().nullable().optional(),
  externalUrl: z.string().url().nullable().optional(),
  message: z.string().nullable().optional(),
  actions: z
    .array(z.enum(["CHARGE, REFUND, CANCEL"]))
    .nullable()
    .optional(),
});

export type TransactionEventSchema = z.infer<typeof transactionEventSchema>;

export const MAX_PAYMENT_GROUP_FOLLOWERS = 20;

const paymentGroupSchema = z.discriminatedUnion("role", [
  z.object({ role: z.literal("follower") }),
  z.object({
    role: z.literal("leader"),
    followers: z
      .array(
        z.object({
          checkoutId: z.string().min(1),
          transactionId: z.string().min(1),
        }),
      )
      .min(1)
      .max(MAX_PAYMENT_GROUP_FOLLOWERS),
  }),
]);

export type PaymentGroupRequest = z.infer<typeof paymentGroupSchema>;

export const transactionInitializeDataSchema = z.object({
  metadata: z.record(z.string(), z.string()).optional(),
  paymentGroup: paymentGroupSchema.optional(),
  paymentMethodId: z.string().optional(),
  saveForFutureUse: z.boolean().optional(),
  /**
   * Agent-granted credential the agentic checkout flow pays with. Named here
   * rather than forwarded blindly, like every other intent option.
   */
  sharedPaymentToken: z.string().optional(),
});

export type TransactionInitializeDataSchema = z.infer<
  typeof transactionInitializeDataSchema
>;

export const parseTransactionInitializeData = (
  data: unknown,
): TransactionInitializeDataSchema => {
  const result = transactionInitializeDataSchema.safeParse(data ?? {});

  return result.success ? result.data : {};
};

export const requestsPaymentGroup = (data: unknown) =>
  typeof data === "object" && data !== null && "paymentGroup" in data;
