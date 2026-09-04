import { hc } from "hono/client";

import {
  type SettingsFormData,
  type SettingsFormInput,
} from "@nimara/infrastructure/use-cases/apps/saleor/settings-form";
import { apiErrorMessage } from "@nimara/lib/client/api/error-message";

import { type AppSettings } from "@/domain/app-config";
import { type AppType } from "@/services/handler/entry-server";

// Typed RPC client for the app's own API; shapes inferred from the routes.
const client = hc<AppType>(window.env.BASE_PATH || "/");

const settingsApi = client.api.app.settings;

/**
 * The tenant is not sent: the server derives it from the verified token, so a
 * value passed here could only ever disagree with it.
 */
export const fetchSettings = async ({
  accessToken,
  saleorApiUrl,
}: {
  accessToken: string;
  saleorApiUrl: string;
}) => {
  const response = await settingsApi.fetch.$post({
    header: {
      authorization: `Bearer ${accessToken}`,
      "saleor-api-url": saleorApiUrl,
    },
  });

  if (!response.ok) {
    throw new Error(await apiErrorMessage(response));
  }

  // The untyped error responses break hono's inference — narrow by hand.
  return response.json() as Promise<SettingsFormData<AppSettings>>;
};

export const saveSettings = async ({
  accessToken,
  data,
  saleorApiUrl,
}: {
  accessToken: string;
  data: SettingsFormInput<AppSettings>;
  saleorApiUrl: string;
}): Promise<string | null> => {
  const response = await settingsApi.save.$post({
    header: {
      authorization: `Bearer ${accessToken}`,
      "saleor-api-url": saleorApiUrl,
    },
    json: data,
  });

  if (!response.ok) {
    return apiErrorMessage(response);
  }

  return null;
};
