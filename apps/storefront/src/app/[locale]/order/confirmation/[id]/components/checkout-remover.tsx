"use client";

import { useEffect } from "react";

import { QUERY_PARAMS } from "@/lib/paths";

import { clearCheckoutCookieAction } from "../actions";

export const CheckoutRemover = ({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [QUERY_PARAMS.orderPlaced]: string }>;
}) => {
  useEffect(() => {
    void (async () => {
      if (QUERY_PARAMS.orderPlaced in (await searchParams)) {
        const { id } = await params;

        await clearCheckoutCookieAction({ id });
      }
    })();
  }, []);

  return null;
};
