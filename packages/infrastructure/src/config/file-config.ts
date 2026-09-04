import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

import { type z } from "zod";

import { err, ok } from "@nimara/domain/objects/Result";

import { type ConfigItemRepository } from "#root/config/types";
import { type Logger } from "#root/logging/types";

const isMissingFile = (error: unknown) =>
  !!error &&
  typeof error === "object" &&
  "code" in error &&
  error.code === "ENOENT";

/**
 * `ConfigItemRepository` backed by a JSON file on the local disk — lets the
 * app run without a cloud account. The file is a dotfile beside the app, so
 * the store path names it rather than pointing anywhere.
 */
export const fileConfigItem = <TValue>({
  configKey,
  schema,
  logger,
}: {
  configKey: string;
  logger?: Logger;
  schema: z.ZodType<TValue>;
}): ConfigItemRepository<TValue> => {
  const filePath = `.${configKey}.json`;

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
