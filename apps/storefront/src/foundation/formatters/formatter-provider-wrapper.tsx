"use client";

import { LocalizedFormatterProvider } from "@nimara/foundation/formatters/use-localized-formatter";
import { localizedFormatter } from "@nimara/foundation/formatters/util";

import { useCurrentRegion } from "@/foundation/regions";

export const FormatterProviderWrapper = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const region = useCurrentRegion();
  const formatter = localizedFormatter({ region });

  return (
    <LocalizedFormatterProvider formatter={formatter}>
      {children}
    </LocalizedFormatterProvider>
  );
};
