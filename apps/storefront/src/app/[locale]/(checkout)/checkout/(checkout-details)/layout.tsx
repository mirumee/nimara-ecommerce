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
    <section className="grid min-h-screen grid-cols-1 md:grid-cols-[3fr_2fr]">
      <div className="flex justify-center xl:mr-48 xl:justify-end">
        <main className="w-full max-w-md space-y-4 p-4">
          <div className="flex w-full">
            <Logo />
          </div>
          <div className="flex flex-col gap-8 divide-y pt-8">{children}</div>
        </main>
      </div>
      <aside className="hidden bg-gray-100 md:block">
        <SideSummary />
      </aside>
      <aside className="absolute right-0 pt-4 md:hidden">
        <SideSummary />
      </aside>
    </section>
  );
}
