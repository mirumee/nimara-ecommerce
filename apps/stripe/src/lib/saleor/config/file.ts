import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

import {
  parseStoredConfig,
  type SaleorAppConfig,
  type SaleorMultiTenantAppConfig,
} from "./schema";
import { createSaleorAppConfigProvider } from "./store";
import type { SaleorAppConfigProviderFactory } from "./types";

type Config = SaleorAppConfig;

const isMissingFile = (err: unknown) =>
  !!err && typeof err === "object" && "code" in err && err.code === "ENOENT";

/**
 * Stores the config of every installed Saleor in a JSON file on the local disk,
 * so the app runs without a Vercel account. Development only: a serverless
 * filesystem is ephemeral and not shared between instances, so a deployment
 * must use `SaleorEdgeConfigProvider` instead.
 */
export const SaleorFileConfigProvider: SaleorAppConfigProviderFactory<
  { filePath: string },
  Config
> = ({ filePath }) => {
  const read = async (): Promise<SaleorMultiTenantAppConfig> => {
    let contents: string;

    try {
      contents = await readFile(filePath, "utf8");
    } catch (err) {
      if (isMissingFile(err)) {
        return {};
      }

      throw new Error(`Failed to read config file ${filePath}.`, {
        cause: err,
      });
    }

    if (!contents.trim()) {
      return {};
    }

    try {
      return parseStoredConfig(JSON.parse(contents));
    } catch (err) {
      throw new Error(`Failed to parse config file ${filePath}.`, {
        cause: err,
      });
    }
  };

  const write = async (configs: SaleorMultiTenantAppConfig) => {
    await mkdir(dirname(filePath), { recursive: true });

    /**
     * The file holds Stripe secret keys and Saleor auth tokens, so it is created
     * readable by its owner only. `mode` applies at creation, so a file that
     * already exists keeps whatever permissions it has.
     */
    await writeFile(filePath, `${JSON.stringify(configs, null, 2)}\n`, {
      encoding: "utf8",
      mode: 0o600,
    });
  };

  return createSaleorAppConfigProvider({ read, write });
};
