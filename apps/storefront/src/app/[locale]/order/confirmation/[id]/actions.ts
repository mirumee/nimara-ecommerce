"use server";

import { cookies } from "next/headers";
import { redirect, RedirectType } from "next/navigation";

import { COOKIE_KEY } from "@/config";
import { paths } from "@/lib/paths";

export const clearCheckoutCookieAction = async ({ id }: { id: string }) => {
  const nextCookies = await cookies();

  nextCookies.delete(COOKIE_KEY.checkoutId);
  redirect(paths.order.confirmation.asPath({ id }), RedirectType.replace);
};
