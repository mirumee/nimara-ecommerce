import "@nimara/ui/styles/globals";

import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Script from "next/script";
import { hasLocale } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { NuqsAdapter } from "nuqs/adapters/next/app";

import { aspekta } from "@nimara/foundation/fonts";
import { cn } from "@nimara/foundation/lib/cn";
import { themePreloadScript } from "@nimara/foundation/theme/theme-preload-script";
import { ClientThemeProvider } from "@nimara/foundation/theme/theme-provider";
import { I18nProvider } from "@nimara/i18n/provider";
import { routing } from "@nimara/i18n/routing";
import { Toaster } from "@nimara/ui/components/toaster";

import { clientEnvs } from "@/envs/client";
import { ErrorServiceServer } from "@/foundation/errors/error-service/error-service-server";

export const metadata: Metadata = {
  metadataBase: new URL(clientEnvs.NEXT_PUBLIC_STOREFRONT_URL),
  title: {
    template: `%s | ${clientEnvs.NEXT_PUBLIC_DEFAULT_PAGE_TITLE}`,
    default: clientEnvs.NEXT_PUBLIC_DEFAULT_PAGE_TITLE,
  },
};

export default async function LocaleLayout({
  children,
  params,
}: LayoutProps<"/[locale]">) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const messages = await getMessages({ locale });

  if (!messages) {
    notFound();
  }

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={cn(
          "min-h-[100dvh]",
          "flex flex-col",
          "bg-background",
          aspekta.className,
        )}
      >
        <Script
          id="theme-preload"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: themePreloadScript }}
        />
        <I18nProvider locale={locale} messages={messages}>
          <ClientThemeProvider>
            <NuqsAdapter>
              {children}
              <SpeedInsights />
              <Toaster />
              <ErrorServiceServer />
            </NuqsAdapter>
          </ClientThemeProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
