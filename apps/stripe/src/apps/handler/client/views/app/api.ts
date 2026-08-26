import { hc, type InferRequestType } from "hono/client";

import { type ResponseSchema } from "@nimara/lib/api/schema";

import { type AppType } from "@/apps/handler/entry-server";
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

/**
 * The tenant is not sent: the server derives it from the verified token, so a
 * value passed here could only ever disagree with it.
 */
export const fetchConfigData = async ({
  accessToken,
  saleorApiUrl,
}: {
  accessToken: string;
  saleorApiUrl: string;
}) => {
  const response = await configApi.fetch.$post({
    header: {
      authorization: `Bearer ${accessToken}`,
      "saleor-api-url": saleorApiUrl,
    },
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
  saleorApiUrl,
}: {
  accessToken: string;
  data: InferRequestType<typeof configApi.save.$post>["json"]["data"];
  saleorApiUrl: string;
}): Promise<string | null> => {
  const response = await configApi.save.$post({
    header: {
      authorization: `Bearer ${accessToken}`,
      "saleor-api-url": saleorApiUrl,
    },
    json: { data },
  });

  if (!response.ok) {
    return errorMessage(response);
  }

  return null;
};
