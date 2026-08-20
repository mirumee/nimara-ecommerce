import { z } from "zod";

import { err, ok } from "@nimara/domain/objects/Result";

import { type ConfigItemRepository } from "#root/config/types";
import { readEnv } from "#root/lib/env/env";
import { type Logger } from "#root/logging/types";

const VERCEL_API_URL_BASE = "https://api.vercel.com/v1/edge-config";

const vercelEnvSchema = z.object({
  VERCEL_ACCESS_TOKEN: z.string(),
  VERCEL_EDGE_CONFIG_ID: z.string(),
  VERCEL_TEAM_ID: z.string(),
});

// Credentials are read from the env, not passed in.
export const vercelEdgeConfigItem = <TValue>({
  configKey,
  schema,
  logger,
}: {
  configKey: string;
  logger?: Logger;
  schema: z.ZodType<TValue>;
}): ConfigItemRepository<TValue> => {
  const { VERCEL_ACCESS_TOKEN, VERCEL_EDGE_CONFIG_ID, VERCEL_TEAM_ID } =
    readEnv({ name: "Vercel Edge Config", schema: vercelEnvSchema });

  return {
    get: async () => {
      try {
        const response = await fetch(
          `${VERCEL_API_URL_BASE}/${VERCEL_EDGE_CONFIG_ID}/item/${configKey}?teamId=${VERCEL_TEAM_ID}`,
          {
            method: "GET",
            headers: { Authorization: `Bearer ${VERCEL_ACCESS_TOKEN}` },
          },
        );

        if (!response.ok) {
          throw new Error("Failed to fetch edge config.", {
            cause: { status: response.status, text: response.statusText },
          });
        }

        if (response.status === 204) {
          return ok(null);
        }

        const data = (await response.json()).value;

        if (!data) {
          return ok(null);
        }

        return ok(schema.parse(data));
      } catch (error) {
        logger?.error("Failed to read config from Edge Config.", {
          error,
          configKey,
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
        const response = await fetch(
          `${VERCEL_API_URL_BASE}/${VERCEL_EDGE_CONFIG_ID}/items?teamId=${VERCEL_TEAM_ID}`,
          {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${VERCEL_ACCESS_TOKEN}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              items: [{ operation: "upsert", key: configKey, value }],
            }),
          },
        );

        if (!response.ok) {
          throw new Error("Failed to update edge config.", {
            cause: { status: response.status, text: response.statusText },
          });
        }

        return ok(value);
      } catch (error) {
        logger?.error("Failed to write config to Edge Config.", {
          error,
          configKey,
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
