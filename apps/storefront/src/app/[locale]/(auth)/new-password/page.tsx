import { getTranslations } from "next-intl/server";

import { NewPasswordForm } from "./form";

export async function generateMetadata() {
  const t = await getTranslations("auth");

  return {
    title: t("set-up-new-password"),
  };
}

export default async function ResetPasswordPage() {
  return <NewPasswordForm />;
}
