import { getAccessToken } from "@/services/tokens";

/**
 * Creates a lazy loader function for the access token.
 * @returns A promise that resolves to the access token.
 */
export const createAccessTokenLoader = () => {
  return async () => (await getAccessToken()) ?? null;
};
