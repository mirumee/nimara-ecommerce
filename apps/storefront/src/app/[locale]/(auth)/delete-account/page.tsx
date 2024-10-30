"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

import { Spinner } from "@nimara/ui/components/spinner";

import { deleteUserAccount } from "./actions";

export default function ConfirmAccountDeletionPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  // INFO: Cookies cannot be set during the render because of
  // the e.g. streaming issues. Do not rewrite the component to RSC.
  useEffect(() => {
    void (async () => deleteUserAccount(token))();
  }, []);

  return <Spinner className="mx-auto" />;
}
