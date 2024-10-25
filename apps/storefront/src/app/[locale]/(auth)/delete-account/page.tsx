"use client";

import { useEffect, use } from "react";

import { Spinner } from "@nimara/ui/components/spinner";

import { deleteUserAccount } from "./actions";

export default function ConfirmAccountDeletionPage(
  props: {
    searchParams?: Promise<Record<string, string>>;
  }
) {
  const searchParams = use(props.searchParams);
  const token = searchParams?.token ?? "";

  // INFO: Cookies cannot be set during the render because of
  // the e.g. streaming issues. Do not rewrite the component to RSC.
  useEffect(() => {
    void (async () => deleteUserAccount(token))();
  }, []);

  return <Spinner className="mx-auto" />;
}
