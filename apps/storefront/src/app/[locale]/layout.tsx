import "@nimara/ui/styles/globals";

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import type { ReactNode } from "react";

import { Toaster } from "@nimara/ui/components/toaster";

import { ErrorServiceServer } from "@/components/error-service";
import { clientEnvs } from "@/envs/client";
import { aspekta } from "@/fonts";
import { routing } from "@/i18n/routing";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: {
    template: `%s | ${clientEnvs.NEXT_PUBLIC_DEFAULT_PAGE_TITLE}`,
    default: clientEnvs.NEXT_PUBLIC_DEFAULT_PAGE_TITLE,
  },
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale ?? "en"}>
      <body
        className={cn("min-h-[100dvh]", "flex flex-col", aspekta.className)}
      >
        <NextIntlClientProvider messages={messages}>
          {children}
          <Toaster />
          <ErrorServiceServer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
