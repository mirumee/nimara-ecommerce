import { hc, type InferRequestType } from "hono/client";

import { type AppType } from "@/apps/handler/entry-server";
import { type ResponseSchema } from "@/lib/api/schema";
import { type ConfigFormData } from "@/use-cases/get-config-form-data-use-case";

// Typed RPC client for the app's own config API; shapes inferred from the routes.
const client = hc<AppType>(window.env.BASE_PATH || "/");

const configApi = client.api.app.config;

const errorMessage = async (response: Response) => {
  const body = (await response
    .json()
    .catch(() => null)) as Partial<ResponseSchema> | null;

  const description = body?.description ?? "The request failed.";
  const [firstError] = body?.errors ?? [];
  const detail =
    firstError && firstError.message !== description
      ? ` ${firstError.message}`
      : "";

  return `${description}${detail} (HTTP ${response.status})`;
};

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
    throw new Error(await errorMessage(response));
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
    return errorMessage(response);
  }

  return null;
};
