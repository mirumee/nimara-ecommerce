import {
  CreateQueueCommand,
  type Message,
  SQSClient,
} from "@aws-sdk/client-sqs";
import {
  type SQSBatchResponse,
  type SQSEvent,
  type SQSMessageAttributes,
  type SQSRecord,
} from "aws-lambda";
import { Consumer } from "sqs-consumer";
import { z } from "zod";

import { ensureLocalstackRuntime } from "../aws/localstack.ts";

type QueueHandler = (event: SQSEvent) => Promise<SQSBatchResponse | void>;

export type ProxyLogger = {
  error: (message: string, meta?: Record<string, unknown>) => void;
  info: (message: string, meta?: Record<string, unknown>) => void;
  warning: (message: string, meta?: Record<string, unknown>) => void;
};

export type SqsProxyInput = {
  handler: QueueHandler;
  logger: ProxyLogger;
  queueUrl: string;
};

const RUNNING = Symbol.for("@nimara/tooling/sqs-proxies");

type Running = Map<string, Consumer>;

/**
 * On `globalThis`, not in module scope: vite re-evaluates this module on any
 * edit in the dev graph, and two pollers on one queue split the messages.
 */
const running = (): Running => {
  const global = globalThis as typeof globalThis & { [RUNNING]?: Running };

  global[RUNNING] ??= new Map();

  return global[RUNNING];
};

const toMessageAttributes = (message: Message): SQSMessageAttributes =>
  Object.fromEntries(
    Object.entries(message.MessageAttributes ?? {}).map(([name, value]) => [
      name,
      {
        binaryValue: value.BinaryValue
          ? Buffer.from(value.BinaryValue).toString("base64")
          : undefined,
        dataType: value.DataType ?? "String",
        stringValue: value.StringValue,
      },
    ]),
  );

/**
 * Rebuilds what the event source mapping would have delivered, so the handler
 * under test is the one that ships.
 */
const toRecord = ({
  message,
  queueUrl,
}: {
  message: Message;
  queueUrl: string;
}): SQSRecord => {
  const [account = "", name = ""] = queueUrl.split("/").slice(-2);
  const region = process.env.AWS_REGION ?? "";
  const attributes = message.Attributes ?? {};
  const now = `${Date.now()}`;

  return {
    attributes: {
      ApproximateFirstReceiveTimestamp:
        attributes.ApproximateFirstReceiveTimestamp ?? now,
      ApproximateReceiveCount: attributes.ApproximateReceiveCount ?? "1",
      SenderId: attributes.SenderId ?? "",
      SentTimestamp: attributes.SentTimestamp ?? now,
    },
    awsRegion: region,
    body: message.Body ?? "",
    eventSource: "aws:sqs",
    eventSourceARN: `arn:aws:sqs:${region}:${account}:${name}`,
    md5OfBody: message.MD5OfBody ?? "",
    messageAttributes: toMessageAttributes(message),
    messageId: message.MessageId ?? "",
    receiptHandle: message.ReceiptHandle ?? "",
  };
};

/**
 * For LocalStack only. Against a real account a typo in `queueUrl` would create
 * a queue rather than fail.
 */
const ensureQueue = async ({
  client,
  endpointUrl,
  logger,
  queueUrl,
}: {
  client: SQSClient;
  endpointUrl?: string;
  logger: ProxyLogger;
  queueUrl: string;
}) => {
  if (!endpointUrl) {
    return;
  }

  const name = queueUrl.split("/").pop();

  if (!name) {
    throw new Error(`Cannot read a queue name from "${queueUrl}".`);
  }

  const initialized = await ensureLocalstackRuntime(
    logger,
    `sqs-queue:${queueUrl}`,
    async () => {
      await client.send(new CreateQueueCommand({ QueueName: name }));

      return true;
    },
  );

  if (!initialized) {
    throw new Error(
      `LocalStack is unavailable; cannot ensure SQS queue "${name}".`,
    );
  }

  logger.info(`SQS queue ready: ${name}`, { queueUrl });
};

/**
 * The SDK reads these from the environment rather than from the constructor, so
 * a missing one surfaces deep inside the first poll.
 */
const requireAwsEnvironment = () => {
  const parsed = z
    .object({
      AWS_ACCESS_KEY_ID: z.string(),
      AWS_ENDPOINT_URL: z.preprocess(
        (value) => value || undefined,
        z.url().optional(),
      ),
      AWS_REGION: z.string(),
      AWS_SECRET_ACCESS_KEY: z.string(),
    })
    .safeParse(process.env);

  if (!parsed.success) {
    throw new Error(
      `The SQS proxy needs an AWS environment:\n${parsed.error.issues
        .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
        .join("\n")}`,
    );
  }

  return parsed.data;
};

/**
 * DEV only: stands in for the event source mapping that drives a queue service
 * in production, so what runs locally is the deployed code path.
 */
export const createSqsProxy = ({
  handler,
  logger,
  queueUrl,
}: SqsProxyInput) => {
  const { AWS_ENDPOINT_URL } = requireAwsEnvironment();

  const client = new SQSClient({});

  const consumer = Consumer.create({
    handleMessageBatch: async (messages) => {
      const response = await handler({
        Records: messages.map((message) => toRecord({ message, queueUrl })),
      });

      const failed = new Set(
        response?.batchItemFailures.map(({ itemIdentifier }) => itemIdentifier),
      );

      // What is returned is what gets deleted, so a reported failure stays on
      // the queue until its visibility timeout, exactly as in production.
      return messages.filter(({ MessageId }) => !failed.has(MessageId ?? ""));
    },
    messageAttributeNames: ["All"],
    messageSystemAttributeNames: ["All"],
    queueUrl,
    sqs: client,
  });

  consumer.on("error", (error) => {
    logger.error(`SQS proxy error: ${error.message}`, { queueUrl });
  });

  consumer.on("processing_error", (error) => {
    logger.error(`SQS proxy failed to process a message: ${error.message}`, {
      queueUrl,
    });
  });

  return {
    start: async () => {
      running().get(queueUrl)?.stop();

      await ensureQueue({
        client,
        endpointUrl: AWS_ENDPOINT_URL,
        logger,
        queueUrl,
      });

      consumer.start();
      running().set(queueUrl, consumer);

      logger.info(`Polling ${queueUrl}`);
    },
  };
};
