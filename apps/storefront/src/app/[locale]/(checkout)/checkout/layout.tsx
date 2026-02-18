import { type Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { Logo } from "@/features/header/logo";
import { ThemeToggle } from "@/features/header/theme-toggle";

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

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen grid-rows-[auto_1fr_auto]">
      <header className="container flex items-center justify-between">
        <div className="bg-background px-0 py-4">
          <Logo />
        </div>

        <ThemeToggle />
      </header>

      <main className="bg-muted py-8">
        <div className="container">{children}</div>
      </main>

      <footer className="container">{/* Footer */}</footer>
    </div>
  );
}
