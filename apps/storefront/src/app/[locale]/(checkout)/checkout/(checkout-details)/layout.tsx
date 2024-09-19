import { type Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { type ReactNode } from "react";

import { Logo } from "@/components/header/logo";
import { SideSummary } from "@/components/summary/side-summary";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();

  return {
    robots: {
      follow: false,
      index: false,
      googleBot: {
        follow: false,
        index: false,
      },
    },
    title: t("common.checkout"),
  };
}

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <section className="mx-auto grid w-full max-w-7xl grid-cols-12">
      <main className="col-span-12 w-full space-y-4 justify-self-center px-0 pt-4 xs:px-6 md:col-span-7 md:max-w-md">
        <div className="flex w-full">
          <Logo />
        </div>
        <div className="flex flex-col gap-8 divide-y pt-6">{children}</div>
      </main>
      <SideSummary />
    </section>
  );
}
