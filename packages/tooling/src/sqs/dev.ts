import { type SQSBatchResponse, type SQSEvent } from "aws-lambda";

import { createSqsProxy, type ProxyLogger } from "./proxy.ts";

type QueueService = {
  handler: (event: SQSEvent) => Promise<SQSBatchResponse | void>;
};

// `./services/order-sync/entry-queue.ts` names `ORDER_SYNC_QUEUE_URL`.
const queueVariable = (path: string) =>
  `${(path.split("/").at(-2) ?? "").toUpperCase().replaceAll("-", "_")}_QUEUE_URL`;

// Node reports a refused connection as an `AggregateError` with no message.
const describeError = (error: unknown): string => {
  if (error instanceof AggregateError) {
    return error.errors.map(describeError).join("; ");
  }

  return error instanceof Error ? error.message || error.name : String(error);
};

export type StartQueueProxiesInput = {
  logger: ProxyLogger;
  queues: Record<string, () => Promise<unknown>>;
};

export const startQueueProxies = async ({
  logger,
  queues,
}: StartQueueProxiesInput) => {
  for (const path of Object.keys(queues).sort()) {
    // Thrown, this would take the HTTP services down with the queue.
    try {
      const variable = queueVariable(path);
      const queueUrl = process.env[variable];

      if (!queueUrl) {
        throw new Error(`${variable} is not set.`);
      }

      const { handler } = (await queues[path]()) as QueueService;

      await createSqsProxy({ handler, logger, queueUrl }).start();
    } catch (error) {
      logger.error(`Cannot poll the queue of ${path}: ${describeError(error)}`);
    }
  }
};
