import "server-only";

import { cookies } from "next/headers";

import { CONSENT_COOKIE_NAME, parseConsent } from "./cookie";
import {
  type ConsentCategories,
  type ConsentCategory,
  type ConsentRecord,
  DEFAULT_CONSENT,
} from "./types";

export const readServerConsent = async (): Promise<ConsentRecord | null> => {
  const cookieStore = await cookies();

  return parseConsent(cookieStore.get(CONSENT_COOKIE_NAME)?.value);
};

export const getServerConsentCategories =
  async (): Promise<ConsentCategories> => {
    const record = await readServerConsent();

    return record?.categories ?? DEFAULT_CONSENT;
  };

export const hasServerConsentFor = async (
  category: ConsentCategory,
): Promise<boolean> => {
  const categories = await getServerConsentCategories();

  return categories[category];
};
