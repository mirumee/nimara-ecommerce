"use client";

import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect } from "react";

import type { User } from "@nimara/domain/objects/User";
import { useToast } from "@nimara/ui/hooks";

const DynamicAccountDeletedModal = dynamic(
  () =>
    import("./account-deleted-modal").then((mod) => ({
      default: mod.AccountDeletedModal,
    })),
  { ssr: false },
);

export function AccountNotifications({ user }: { user: User | null }) {
  const t = useTranslations();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const isLoginSuccessful = searchParams.get("loggedIn") === "true";
  const isLogoutSuccessful = searchParams.get("loggedOut") === "true";
  const isAccountDeleted = searchParams.get("accountDeleted") === "true";

  useEffect(() => {
    if (isLoginSuccessful && user?.id) {
      toast({
        description: t("account.greetings", { username: user?.firstName }),
        position: "center",
      });
    }
    if (isLogoutSuccessful) {
      toast({
        description: t("account.until-next-time"),
        position: "center",
      });
    }
  }, [isLoginSuccessful, isLogoutSuccessful, user]);

  return <DynamicAccountDeletedModal open={isAccountDeleted} />;
}
