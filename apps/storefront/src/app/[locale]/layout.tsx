import "@nimara/ui/styles/globals";

import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Script from "next/script";
import { hasLocale } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";

import { aspekta } from "@nimara/foundation/fonts";
import { cn } from "@nimara/foundation/lib/cn";
import { themePreloadScript } from "@nimara/foundation/theme/theme-preload-script";
import { ClientThemeProvider } from "@nimara/foundation/theme/theme-provider";
import { I18nProvider } from "@nimara/i18n/provider";
import { routing } from "@nimara/i18n/routing";
import { Toaster } from "@nimara/ui/components/toaster";

import { clientEnvs } from "@/envs/client";
import { DEFAULT_CONSENT } from "@/foundation/consent";
import { readServerConsent } from "@/foundation/consent/server";
import { CookieConsent } from "@/foundation/cookie-consent";
import { ErrorServiceServer } from "@/foundation/errors/error-service/error-service-server";
import { GoogleTagManager } from "@/foundation/google-tag-manager";

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

  const [consentRecord, messages] = await Promise.all([
    readServerConsent(),
    getMessages({ locale }),
  ]);

  if (!messages) {
    notFound();
  }

  const isConsentAccepted =
    consentRecord !== null || process.env.NODE_ENV === "development";
  const initialConsentCategories = consentRecord?.categories ?? DEFAULT_CONSENT;

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={cn(
          "min-h-[100dvh]",
          "flex flex-col",
          "bg-background",
          "transition-colors",
          aspekta.className,
        )}
      >
        <Script
          id="theme-preload"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: themePreloadScript }}
        />
        {clientEnvs.NEXT_PUBLIC_GTM_ID && (
          <GoogleTagManager
            auth={clientEnvs.NEXT_PUBLIC_GTM_AUTH}
            categories={initialConsentCategories}
            gtmId={clientEnvs.NEXT_PUBLIC_GTM_ID}
            preview={clientEnvs.NEXT_PUBLIC_GTM_PREVIEW}
          />
        )}
        <I18nProvider locale={locale} messages={messages}>
          <ClientThemeProvider>
            {children}
            {initialConsentCategories.analytics && <SpeedInsights />}
            <Toaster />
            <ErrorServiceServer />
            <CookieConsent
              initialCategories={initialConsentCategories}
              isConsentAccepted={isConsentAccepted}
            />
          </ClientThemeProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
