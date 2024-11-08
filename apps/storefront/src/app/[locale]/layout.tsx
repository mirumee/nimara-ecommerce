import "@nimara/ui/styles/globals";

import type { Metadata } from "next";
import { NextIntlClientProvider, useMessages } from "next-intl";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import type { ReactNode } from "react";

import { Toaster } from "@nimara/ui/components/toaster";

import { ErrorServiceServer } from "@/components/error-service";
import { clientEnvs } from "@/envs/client";
import { aspekta } from "@/fonts";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: {
    template: `%s | ${clientEnvs.NEXT_PUBLIC_DEFAULT_PAGE_TITLE}`,
    default: clientEnvs.NEXT_PUBLIC_DEFAULT_PAGE_TITLE,
  },
};

export default function LocaleLayout({
  children,
  params: { locale },
}: {
  children: ReactNode;
  params: { locale: string };
}) {
  const messages = useMessages();

  return (
    <html lang={locale ?? "en"}>
      <body
        className={cn("min-h-[100dvh]", "flex flex-col", aspekta.className)}
      >
        <NextIntlClientProvider messages={messages}>
          <NuqsAdapter>
            {children}
            <Toaster />
            <ErrorServiceServer />
          </NuqsAdapter>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
