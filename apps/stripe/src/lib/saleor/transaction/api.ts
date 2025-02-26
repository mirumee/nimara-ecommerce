import { type IntRange } from "@/lib/types";

import { type TransactionEventSchema, transactionEventSchema } from "./schema";

export const transactionResponseSuccess = ({
  status = 200,
  ...response
}: {
  status?: IntRange<200, 299>;
} & TransactionEventSchema) =>
  Response.json(transactionEventSchema.parse(response), { status });
