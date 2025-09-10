import "@nimara/ui/styles/globals";

import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Script from "next/script";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { NuqsAdapter } from "nuqs/adapters/next/app";

import { Toaster } from "@nimara/ui/components/toaster";

import { ErrorServiceServer } from "@/components/error-service";
import { clientEnvs } from "@/envs/client";
import { aspekta } from "@/fonts";
import { routing } from "@/i18n/routing";
import { themePreloadScript } from "@/lib/scripts/theme-preload-script";
import { cn } from "@/lib/utils";
import { ClientThemeProvider } from "@/providers/theme-provider";

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

  if (!routing.locales.includes(locale as any)) {
    notFound();
  }
  const messages = await getMessages();

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
            <NuqsAdapter>
              {children}
              <SpeedInsights />
              <Toaster />
              <ErrorServiceServer />
            </NuqsAdapter>
          </NextIntlClientProvider>
        </ClientThemeProvider>
      </body>
    </html>
  );
}
