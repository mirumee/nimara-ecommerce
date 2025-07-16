import { getTranslations } from "next-intl/server";

import { redirect } from "@/i18n/routing";
import { paths } from "@/lib/paths";
import { type SupportedLocale } from "@/regions/types";
import { getAuthService } from "@/services/auth";

type PageProps = {
  params: Promise<{ locale: SupportedLocale }>;
  searchParams?: Promise<Record<"email" | "token", string>>;
};

export default async function ConfirmAccountRegistrationPage(props: PageProps) {
  const [{ locale }, searchParams, t] = await Promise.all([
    props.params,
    props.searchParams,
    getTranslations(),
  ]);
  const email = searchParams?.email;
  const token = searchParams?.token;

  if (!email) {
    return t("auth.confirm-missing-email");
  }

  if (!token) {
    return t("auth.confirm-missing-token");
  }

  const authService = await getAuthService();
  const result = await authService.confirmAccount(searchParams);

  if (!result.ok) {
    return t("auth.confirm-account-fail");
  }

  redirect({
    href: paths.signIn.asPath({ query: { confirmationSuccess: "true" } }),
    locale,
  });
}
