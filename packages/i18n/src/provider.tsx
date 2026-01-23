"use client";

import { type Messages, NextIntlClientProvider } from "next-intl";
import type { PropsWithChildren } from "react";

import { type SupportedLocale } from "./config";

interface Props {
  locale: SupportedLocale;
  messages: Messages;
}

export const I18nProvider = ({
  locale,
  messages,
  children,
}: PropsWithChildren<Props>) => {
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
};
