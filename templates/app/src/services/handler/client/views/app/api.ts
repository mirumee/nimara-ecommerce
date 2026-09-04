import { hc } from "hono/client";

import { apiErrorMessage } from "@nimara/lib/client/api/error-message";

import {
  type ConfigFormInput,
  type ConfigFormSchema,
} from "@/services/handler/api/rest/app/schema";
import { type AppType } from "@/services/handler/entry-server";
import { type ConfigFormData } from "@/use-cases/get-config-form-data-use-case";

// Typed RPC client for the app's own API; shapes inferred from the routes.
const client = hc<AppType>(window.env.BASE_PATH || "/");

const configApi = client.api.app.config;

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
    throw new Error(await apiErrorMessage(response));
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
  data: ConfigFormInput;
  saleorApiUrl: string;
}): Promise<string | null> => {
  const response = await configApi.save.$post({
    header: {
      authorization: `Bearer ${accessToken}`,
      "saleor-api-url": saleorApiUrl,
    },
    json: data as ConfigFormSchema,
  });

  if (!response.ok) {
    return apiErrorMessage(response);
  }

  return null;
};
