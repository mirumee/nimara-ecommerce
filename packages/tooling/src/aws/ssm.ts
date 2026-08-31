import { PutParameterCommand, SSMClient } from "@aws-sdk/client-ssm";

import { type BootstrapLogger, ensureLocalstackRuntime } from "./localstack.ts";

export const ensureParameterStore = async ({
  logger,
  storePath,
}: {
  logger: BootstrapLogger;
  storePath: string;
}) => {
  if (!process.env.AWS_ENDPOINT_URL) {
    logger.info(
      "Skipping Parameter Store bootstrap: AWS_ENDPOINT_URL is not set.",
    );

    return;
  }

  const client = new SSMClient();

  const initialized = await ensureLocalstackRuntime(
    logger,
    `parameter-store:${storePath}`,
    async () => {
      await client.send(
        new PutParameterCommand({
          Name: `${storePath}/.namespace`,
          Overwrite: true,
          Type: "String",
          Value: "init",
        }),
      );

      return true;
    },
  );

  if (initialized) {
    logger.info(`Parameter Store namespace ready: ${storePath}/.namespace`);
  }
};
