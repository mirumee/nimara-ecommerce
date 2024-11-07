"use client";

import Cookies from "js-cookie";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

import { COOKIE_KEY } from "@/config";
import { usePathname, useRouter } from "@/i18n/routing";
import { QUERY_PARAMS } from "@/lib/paths";

export const CheckoutRemover = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const isOrderCreated = searchParams.get(QUERY_PARAMS.orderPlace) === "true";

    if (isOrderCreated) {
      Cookies.remove(COOKIE_KEY.checkoutId);
      router.replace(pathname, { scroll: false });
    }
  }, []);

  return null;
};
