import {
  CreateSecretCommand,
  GetSecretValueCommand,
  PutSecretValueCommand,
  ResourceNotFoundException,
  SecretsManagerClient,
} from "@aws-sdk/client-secrets-manager";
import { type z } from "zod";

import { err, ok } from "@nimara/domain/objects/Result";

import { requireAwsEnvironment } from "#root/aws/env";
import { type ConfigItemRepository } from "#root/config/types";
import { type Logger } from "#root/logging/types";

/**
 * `ConfigItemRepository` backed by an AWS Secrets Manager secret. Region,
 * credentials, and `AWS_ENDPOINT_URL` (LocalStack) come from the standard AWS
 * SDK environment variables.
 */
export const awsSecretsManagerConfigItem = <TValue>({
  configKey,
  encryptionKey,
  schema,
  logger,
}: {
  configKey: string;
  encryptionKey?: string;
  logger?: Logger;
  schema: z.ZodType<TValue>;
}): ConfigItemRepository<TValue> => {
  requireAwsEnvironment("AWS Secrets Manager");

  const client = new SecretsManagerClient();

  return {
    get: async () => {
      try {
        const response = await client.send(
          new GetSecretValueCommand({ SecretId: configKey }),
        );

        if (!response.SecretString) {
          return ok(null);
        }

        return ok(schema.parse(JSON.parse(response.SecretString)));
      } catch (error) {
        if (error instanceof ResourceNotFoundException) {
          return ok(null);
        }

        logger?.error("Failed to read config from Secrets Manager.", {
          configKey,
          error,
        });

        return err([
          {
            code: "SALEOR_APP_CONFIG_FETCH_ERROR",
            message: "Failed to read the app config.",
            originalError: error,
          },
        ]);
      }
    },

    upsert: async ({ value }) => {
      const secretString = JSON.stringify(value);

      try {
        try {
          await client.send(
            new PutSecretValueCommand({
              SecretId: configKey,
              SecretString: secretString,
            }),
          );
        } catch (error) {
          if (!(error instanceof ResourceNotFoundException)) {
            throw error;
          }

          await client.send(
            new CreateSecretCommand({
              Name: configKey,
              SecretString: secretString,
              ...(encryptionKey ? { KmsKeyId: encryptionKey } : {}),
            }),
          );
        }

        return ok(value);
      } catch (error) {
        logger?.error("Failed to write config to Secrets Manager.", {
          configKey,
          error,
        });

        return err([
          {
            code: "SALEOR_APP_CONFIG_SAVE_ERROR",
            message: "Failed to save the app config.",
            originalError: error,
          },
        ]);
      }
    },
  };
};
