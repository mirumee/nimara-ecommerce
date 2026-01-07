import "@nimara/ui/styles/globals";

import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Script from "next/script";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { NuqsAdapter } from "nuqs/adapters/next/app";

import { Toaster } from "@nimara/ui/components/toaster";

import { ErrorServiceServer } from "@nimara/foundation/errors/error-service/error-service-server";
import { getServiceRegistry } from "@/services/registry";
import { clientEnvs } from "@/envs/client";
import { routing } from "@/i18n/routing";
import { LocalizedLinkProviderWrapper } from "@/i18n/localized-link-provider-wrapper";
import { FormatterProviderWrapper } from "@/foundation/formatters/formatter-provider-wrapper";
import { cn } from "@nimara/foundation/lib/cn";
import { aspekta } from "@nimara/foundation/fonts";
import { themePreloadScript } from "@nimara/foundation/theme/theme-preload-script";
import { ClientThemeProvider } from "@nimara/foundation/theme/theme-provider";

export const metadata: Metadata = {
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

  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }
  const [messages, services] = await Promise.all([
    getMessages(),
    getServiceRegistry(),
  ]);

  return (
    <html lang={locale ?? "en"} suppressHydrationWarning>
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
        <ClientThemeProvider>
          <NextIntlClientProvider messages={messages}>
            <LocalizedLinkProviderWrapper>
              <FormatterProviderWrapper>
                <NuqsAdapter>
                  {children}
                  <SpeedInsights />
                  <Toaster />
                  <ErrorServiceServer services={services} />
                </NuqsAdapter>
              </FormatterProviderWrapper>
            </LocalizedLinkProviderWrapper>
          </NextIntlClientProvider>
        </ClientThemeProvider>
      </body>
    </html>
  );
}
