import { type ResponseSchema } from "#root/api/schema";

/**
 * What a failed call to the app's own API says. A response that does not carry
 * the app's error shape still reads as something.
 */
export const apiErrorMessage = async (response: Response) => {
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
