import "@nimara/ui/styles/globals";

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import {
  getMessages,
  getTranslations,
  setRequestLocale,
} from "next-intl/server";

import { I18nProvider } from "@nimara/i18n/provider";
import { routing } from "@nimara/i18n/routing";
import { Toaster } from "@nimara/ui/components/toaster";

import { Providers } from "@/providers";

const inter = Inter({ subsets: ["latin"] });

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();

  return {
    title: t("marketplace.layout.title"),
    description: t("marketplace.layout.description"),
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = routing.defaultLocale;

  setRequestLocale(locale);

  const messages = await getMessages({ locale });

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <I18nProvider locale={locale} messages={messages}>
          <Providers>
            {children}
            <Toaster />
          </Providers>
        </I18nProvider>
      </body>
    </html>
  );
}
