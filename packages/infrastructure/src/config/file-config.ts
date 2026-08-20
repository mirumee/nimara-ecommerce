import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

import { z } from "zod";

import { err, ok } from "@nimara/domain/objects/Result";

import { type ConfigItemRepository } from "#root/config/types";
import { readEnv } from "#root/lib/env/env";
import { type Logger } from "#root/logging/types";

const fileEnvSchema = z.object({
  CONFIG_FILE_PATH: z.string().default(".saleor-app-config.json"),
});

const isMissingFile = (error: unknown) =>
  !!error &&
  typeof error === "object" &&
  "code" in error &&
  error.code === "ENOENT";

/**
 * `ConfigItemRepository` backed by a JSON file on the local disk — lets the
 * app run without a Vercel account.
 */
export const fileConfigItem = <TValue>({
  schema,
  logger,
}: {
  logger?: Logger;
  schema: z.ZodType<TValue>;
}): ConfigItemRepository<TValue> => {
  const { CONFIG_FILE_PATH: filePath } = readEnv({
    name: "Config file",
    schema: fileEnvSchema,
  });

  return {
    get: async () => {
      try {
        let contents: string;

        try {
          contents = await readFile(filePath, "utf8");
        } catch (error) {
          if (isMissingFile(error)) {
            return ok(null);
          }

          throw error;
        }

        if (!contents.trim()) {
          return ok(null);
        }

        return ok(schema.parse(JSON.parse(contents)));
      } catch (error) {
        logger?.error("Failed to read config file.", { filePath, error });

        return err([
          {
            code: "SALEOR_APP_CONFIG_FETCH_ERROR",
            message: `Failed to read config file ${filePath}.`,
            originalError: error,
          },
        ]);
      }
    },

    upsert: async ({ value }) => {
      try {
        await mkdir(dirname(filePath), { recursive: true });
        // Holds Stripe secret keys + Saleor tokens — owner-readable only.
        await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, {
          encoding: "utf8",
          mode: 0o600,
        });

        return ok(value);
      } catch (error) {
        logger?.error("Failed to write config file.", { filePath, error });

        return err([
          {
            code: "SALEOR_APP_CONFIG_SAVE_ERROR",
            message: `Failed to write config file ${filePath}.`,
            originalError: error,
          },
        ]);
      }
    },
  };
};
