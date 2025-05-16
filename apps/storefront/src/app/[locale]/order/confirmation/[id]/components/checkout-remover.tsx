"use client";

import { useEffect } from "react";

import { useRouter } from "@/i18n/routing";
import { paths, QUERY_PARAMS } from "@/lib/paths";

import { clearCheckoutCookieAction } from "../actions";

export const CheckoutRemover = ({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [QUERY_PARAMS.orderPlaced]: string }>;
}) => {
  const router = useRouter();

  useEffect(() => {
    void (async () => {
      if (QUERY_PARAMS.orderPlaced in (await searchParams)) {
        const { id } = await params;

        await clearCheckoutCookieAction();

        // After clearing the checkout cookie, we remove the `?orderPlaced=true` query param
        // to prevent the action from being triggered again on page reload.
        router.replace(paths.order.confirmation.asPath({ id }));
      }
    })();
  }, []);

  return null;
};
