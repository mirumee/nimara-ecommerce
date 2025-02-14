import { z } from "zod";

/**
 * https://docs.saleor.io/developer/extending/webhooks/synchronous-events/transaction
 *
 * {
 *   "pspReference": "[Optional for some results, see details below] <psp reference recieved from payment provider>",
 *   "result": "CHARGE_SUCCESS or CHARGE_FAILURE or CHARGE_REQUEST or AUTHORIZATION_SUCCESS or AUTHORIZATION_FAILURE or AUTHORIZATION_REQUEST or AUTHORIZATION_ACTION_REQUIRED or CHARGE_ACTION_REQUIRED>",
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
  result: z.enum([
    "CHARGE_SUCCESS",
    "CHARGE_FAILURE",
    "CHARGE_REQUEST",
    "AUTHORIZATION_SUCCESS",
    "AUTHORIZATION_FAILURE",
    "AUTHORIZATION_REQUEST",
    "AUTHORIZATION_ACTION_REQUIRED",
    "CHARGE_ACTION_REQUIRED",
  ]),
  amount: z.string(),
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
