import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { paths } from "@/lib/paths";
import { authService } from "@/services";

export default async function ConfirmAccountRegistrationPage({
  searchParams,
}: {
  searchParams?: Record<"email" | "token", string>;
}) {
  const t = await getTranslations();
  const email = searchParams?.email;
  const token = searchParams?.token;

  if (!email) {
    return t("auth.confirm-missing-email");
  }

  if (!token) {
    return t("auth.confirm-missing-token");
  }

  const data = await authService.confirmAccount(searchParams);

  if (data.isSuccess) {
    redirect(paths.signIn.asPath({ query: { confirmationSuccess: "true" } }));
  }

  if ("errors" in data) {
    return t("auth.confirm-account-fail");
  }

  return t("errors.server.UNEXPECTED_HTTP_ERROR");
}
