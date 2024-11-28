"use server";

import { cookies } from "next/headers";

import { COOKIE_KEY, COOKIE_MAX_AGE } from "@/config";
import { revalidateTag } from "@/lib/cache";

export const revalidateCart = async (id: string) => {
  revalidateTag(`CHECKOUT:${id}`);
};

export const setCheckoutIdCookie = async (id: string) => {
  (await cookies()).set(COOKIE_KEY.checkoutId, id, {
    maxAge: COOKIE_MAX_AGE.checkout,
    httpOnly: true,
  });
};
