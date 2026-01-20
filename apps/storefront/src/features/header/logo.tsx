import { useTranslations } from "next-intl";

import BrandLogo from "@/assets/brand-logo-dark.svg";
import { paths } from "@/foundation/routing/paths";
import { LocalizedLink } from "@/i18n/routing";

export const Logo = () => {
  const t = useTranslations("common");

  return (
    <LocalizedLink
      href={paths.home.asPath()}
      title={t("go-to-homepage")}
      aria-label={t("logo")}
    >
      <BrandLogo height={36} className="fill-primary" />
    </LocalizedLink>
  );
};

Logo.displayName = "Logo";
