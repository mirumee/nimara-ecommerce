import { hc, type InferRequestType } from "hono/client";

import { type AppType } from "@/apps/handler/entry-server";
import { type ConfigFormData } from "@/use-cases/get-config-form-data-use-case";

/**
 * Typed RPC client for the app's own config API (see `api/rest/app`) —
 * request and response shapes are inferred from the routes. Authenticated
 * with the dashboard JWT provided by the Saleor app bridge.
 */
const client = hc<AppType>(window.env.BASE_PATH || "/");

const configApi = client.api.app.config;

export const fetchConfigData = async ({
  accessToken,
  saleorDomain,
}: {
  accessToken: string;
  saleorDomain: string;
}) => {
  const response = await configApi.fetch.$post({
    header: { authorization: `Bearer ${accessToken}` },
    json: { saleorDomain },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch the configuration.");
  }

  // The untyped error responses break hono's inference — narrow by hand.
  return response.json() as Promise<ConfigFormData>;
};

export const saveConfigData = async ({
  accessToken,
  data,
  saleorDomain,
}: {
  accessToken: string;
  data: InferRequestType<typeof configApi.save.$post>["json"]["data"];
  saleorDomain: string;
}): Promise<string | null> => {
  const response = await configApi.save.$post({
    header: { authorization: `Bearer ${accessToken}` },
    json: { saleorDomain, data },
  });

  if (!response.ok) {
    const json = (await response.json().catch(() => null)) as {
      description?: string;
    } | null;

    return json?.description ?? "Failed to save configuration.";
  }

  return null;
};
