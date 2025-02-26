import { z } from "zod";

import { TRANSACTION_EVENT_TYPE } from "./const";

/**
 * https://docs.saleor.io/developer/extending/webhooks/synchronous-events/transaction
 *
 * {
 *   "pspReference": "[Optional for some results, see details below] <psp reference recieved from payment provider>",
 *   "result": <[Optional] TransactionEventTypeEnum>,
 *   "amount": "<Decimal amount of the processed action>",
 *   "data": "<[Optional] JSON data tha will be returned to storefront>",
 *   "time": "<[Optional] time of the action>",
 *   "externalUrl": "<[Optional] external url with action details.",
 *   "message": "<[Optional] message related to the action. The maximum length is 512 characters; any text exceeding this limit will be truncated>",
 *   "actions": "<[Optional] list of actions available for the transaction. Possible items: CHARGE, REFUND, CANCEL>"
 * }
 */

export const transactionEventSchema = z.object({
  pspReference: z.string().nullable().optional(),
  result: z.enum(TRANSACTION_EVENT_TYPE).optional(),
  amount: z.string().optional(),
  created: z.string().nullable().optional(),
  data: z.object({}).passthrough().nullable().optional(),
  time: z.string().nullable().optional(),
  externalUrl: z.string().url().nullable().optional(),
  message: z.string().nullable().optional(),
  actions: z
    .array(z.enum(["CHARGE, REFUND, CANCEL"]))
    .nullable()
    .optional(),
});

export type TransactionEventSchema = z.infer<typeof transactionEventSchema>;
