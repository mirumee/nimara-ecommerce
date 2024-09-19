import { type Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { type ReactNode } from "react";

import { Footer } from "@/components/footer";
import { Logo } from "@/components/header/logo";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();

  return {
    robots: {
      follow: false,
      index: true,
      googleBot: {
        follow: false,
        index: true,
      },
    },
    title: t("common.checkout"),
  };
}

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen flex-col">
      <div className="container flex-grow sm:max-w-3xl md:max-w-4xl xl:max-w-5xl">
        <header className="flex py-4">
          <Logo />
        </header>
        <main className="pt-8">{children}</main>
      </div>
      <Footer />
    </div>
  );
}
