import { COOKIE_KEY } from "@/config";
import { getStoreUrl } from "@/lib/server";

/*
 * It's not an server action, but it can be used to delete the cookie by using Route handlers.
 */
export const deleteCheckoutIdCookie = async () => {
  const storeUrl = await getStoreUrl();
  const url = new URL("/api/cookies/delete", storeUrl);

  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ cookieKey: COOKIE_KEY.checkoutId }),
  });
};
