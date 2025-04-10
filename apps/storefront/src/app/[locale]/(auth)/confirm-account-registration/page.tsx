import { getLocale, getTranslations } from "next-intl/server";

import { redirect } from "@/i18n/routing";
import { paths } from "@/lib/paths";
import { authService } from "@/services";

export default async function ConfirmAccountRegistrationPage(props: {
  searchParams?: Promise<Record<"email" | "token", string>>;
}) {
  const searchParams = await props.searchParams;
  const t = await getTranslations();
  const email = searchParams?.email;
  const token = searchParams?.token;
  const locale = await getLocale();

  if (!email) {
    return t("auth.confirm-missing-email");
  }

  if (!token) {
    return t("auth.confirm-missing-token");
  }

  const result = await authService.confirmAccount(searchParams);

  if (result.ok) {
    redirect({
      href: paths.signIn.asPath({ query: { confirmationSuccess: "true" } }),
      locale,
    });
  }

  if (result.error) {
    return t("auth.confirm-account-fail");
  }

  return t("errors.UNEXPECTED_HTTP_ERROR");
}
