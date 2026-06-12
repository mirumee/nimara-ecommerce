"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

const COOKIE_SETTINGS_QUERY_KEY = "cookie-settings";

/**
 * Reads/writes the `?cookie-settings=true` query param that drives the cookie
 * settings dialog.
 */
export const useCookieSettings = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isOpen = searchParams.get(COOKIE_SETTINGS_QUERY_KEY) === "true";

  const setOpen = (open: boolean) => {
    const params = new URLSearchParams(searchParams.toString());

    if (open) {
      params.set(COOKIE_SETTINGS_QUERY_KEY, "true");
    } else {
      params.delete(COOKIE_SETTINGS_QUERY_KEY);
    }

    const query = params.toString();

    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  };

  return {
    close: () => setOpen(false),
    isOpen,
    open: () => setOpen(true),
  };
};
