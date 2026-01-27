"use client";

import { type Locale, type Messages, NextIntlClientProvider } from "next-intl";
import type { PropsWithChildren } from "react";

import { INTL_FORMATS_CONFIG } from "./config";

interface Props {
  locale: Locale;
  messages: Messages;
  timeZone?: string;
}

export const I18nProvider = ({
  locale,
  messages,
  timeZone = "Europe/London",
  children,
}: PropsWithChildren<Props>) => {
  return (
    <NextIntlClientProvider
      locale={locale}
      messages={messages}
      timeZone={timeZone}
      formats={INTL_FORMATS_CONFIG}
    >
      {children}
    </NextIntlClientProvider>
  );
};
