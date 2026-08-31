import {
  CreateSecretCommand,
  ResourceExistsException,
  SecretsManagerClient,
} from "@aws-sdk/client-secrets-manager";

import { type BootstrapLogger, ensureLocalstackRuntime } from "./localstack.ts";

export const ensureSecretsManager = async ({
  logger,
  storePath,
}: {
  logger: BootstrapLogger;
  storePath: string;
}) => {
  if (!process.env.AWS_ENDPOINT_URL) {
    logger.info(
      "Skipping Secrets Manager bootstrap: AWS_ENDPOINT_URL is not set.",
    );

    return;
  }

  const client = new SecretsManagerClient();

  const initialized = await ensureLocalstackRuntime(
    logger,
    `secrets-manager:${storePath}`,
    async () => {
      try {
        await client.send(
          new CreateSecretCommand({ Name: storePath, SecretString: "{}" }),
        );
      } catch (error) {
        if (!(error instanceof ResourceExistsException)) {
          throw error;
        }
      }

      return true;
    },
  );

  if (initialized) {
    logger.info(`Secrets Manager secret ready: ${storePath}`);
  }
};
