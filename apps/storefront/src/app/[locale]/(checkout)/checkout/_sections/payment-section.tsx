import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

export function PaymentSection({ children }: { children?: ReactNode }) {
  const t = useTranslations("payment");

  return (
    <section className="py-8">
      <h2 className="scroll-m-20 pb-8 text-2xl tracking-tight">{t("title")}</h2>
      {children}
    </section>
  );
}
