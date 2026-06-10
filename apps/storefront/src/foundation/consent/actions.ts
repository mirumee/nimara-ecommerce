"use server";

import { cookies } from "next/headers";

import {
  CONSENT_COOKIE_MAX_AGE_SECONDS,
  CONSENT_COOKIE_NAME,
  serializeConsent,
} from "./cookie";
import { type ConsentCategories } from "./types";

export const setConsentAction = async (
  categories: ConsentCategories,
): Promise<void> => {
  const cookieStore = await cookies();

  cookieStore.set(CONSENT_COOKIE_NAME, serializeConsent(categories), {
    maxAge: CONSENT_COOKIE_MAX_AGE_SECONDS,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    httpOnly: false,
  });
};
