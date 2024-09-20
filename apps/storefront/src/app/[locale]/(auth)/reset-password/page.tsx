import { getTranslations } from "next-intl/server";

import { ResetPasswordForm } from "./form";

export async function generateMetadata() {
  const t = await getTranslations("auth");

  return {
    title: t("reset-password"),
  };
}

export default async function ResetPasswordPage() {
  return <ResetPasswordForm />;
}
