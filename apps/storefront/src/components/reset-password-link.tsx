import Link from "next/link";
import { useTranslations } from "next-intl";

import { paths } from "@/lib/paths";

export const ResetPasswordLink = () => {
  const t = useTranslations("auth");

  return (
    <Link
      className="float-right px-3 text-sm hover:underline"
      href={paths.resetPassword.asPath()}
    >
      {t("i-forgot-my-password")}
    </Link>
  );
};
