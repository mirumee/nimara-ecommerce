import {
  GetParameterCommand,
  ParameterNotFound,
  PutParameterCommand,
  SSMClient,
} from "@aws-sdk/client-ssm";
import { type z } from "zod";

import { err, ok } from "@nimara/domain/objects/Result";

import { requireAwsEnvironment } from "#root/aws/env";
import { type ConfigItemRepository } from "#root/config/types";
import { type Logger } from "#root/logging/types";

/**
 * `ConfigItemRepository` backed by an AWS Systems Manager Parameter Store
 * `SecureString`. Region, credentials, and `AWS_ENDPOINT_URL` (LocalStack)
 * come from the standard AWS SDK environment variables.
 */
export const awsParameterStoreConfigItem = <TValue>({
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
  requireAwsEnvironment("AWS Parameter Store");

  const client = new SSMClient();

  return {
    get: async () => {
      try {
        const response = await client.send(
          new GetParameterCommand({ Name: configKey, WithDecryption: true }),
        );

        const value = response.Parameter?.Value;

        if (!value) {
          return ok(null);
        }

        return ok(schema.parse(JSON.parse(value)));
      } catch (error) {
        if (error instanceof ParameterNotFound) {
          return ok(null);
        }

        logger?.error("Failed to read config from Parameter Store.", {
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
      try {
        await client.send(
          new PutParameterCommand({
            Name: configKey,
            Overwrite: true,
            Type: "SecureString",
            Value: JSON.stringify(value),
            ...(encryptionKey ? { KeyId: encryptionKey } : {}),
          }),
        );

        return ok(value);
      } catch (error) {
        logger?.error("Failed to write config to Parameter Store.", {
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
