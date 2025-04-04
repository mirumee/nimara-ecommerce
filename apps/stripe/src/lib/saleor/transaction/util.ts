import { type Logger } from "@nimara/infrastructure/logging/types";

import { responseError } from "@/lib/api/util";

import { type TransactionEventSchema, transactionEventSchema } from "./schema";

export const constructTransactionEventResponse = ({
  data,
  logger,
  type,
}: {
  data: TransactionEventSchema;
  logger: Logger;
  type: string;
}): Response => {
  const eventResult = transactionEventSchema.safeParse(data);

  if (!eventResult.success) {
    const message = `Failed to construct ${type} event response.`;

    logger.error(message, { errors: eventResult.error.issues });

    return responseError({
      description: message,
      errors: eventResult.error.issues,
      status: 422,
    });
  }

  logger.debug(`Constructed ${type} event response.`, {
    eventResult,
  });

  return Response.json(transactionEventSchema.parse(eventResult.data));
};
