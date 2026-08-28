import { type SQSBatchResponse, type SQSEvent } from "aws-lambda";

import { serializeError } from "@nimara/lib/error/utils";
import { withLogContext } from "@nimara/lib/logging/with-context";
import {
  captureException,
  initSentry,
} from "@nimara/lib/reporting/sentry/instrument";

import { container } from "@/services/consumer/container";

import { processMessage } from "./messages";

const { config, logger } = container.items;

initSentry({
  dsn: config.SENTRY_DSN,
  environment: config.ENVIRONMENT,
  release: config.RELEASE,
});

/**
 * Reporting the failures leaves only those on the queue; throwing would
 * redeliver the whole batch. The event source mapping needs
 * `ReportBatchItemFailures` on for this to be read.
 */
export const handler = async (event: SQSEvent): Promise<SQSBatchResponse> => {
  const batchItemFailures: SQSBatchResponse["batchItemFailures"] = [];

  for (const record of event.Records) {
    const messageLogger = withLogContext({
      context: { messageId: record.messageId },
      logger,
    });

    try {
      await processMessage({ body: record.body, logger: messageLogger });
    } catch (error) {
      messageLogger.error(
        "Failed to process a message.",
        serializeError(error),
      );
      captureException(error);

      batchItemFailures.push({ itemIdentifier: record.messageId });
    }
  }

  return { batchItemFailures };
};
