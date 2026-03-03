import { type PropsWithChildren } from "react";

import { Spinner } from "@nimara/ui/components/spinner";

export const CheckoutWrapper = async ({
  children,
  summary,
}: PropsWithChildren<{
  summary: React.ReactNode;
}>) => {
  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-[3fr_2fr]">
      <div className="flex flex-col gap-8">{children}</div>

      <aside className="relative hidden md:block">{summary}</aside>
      <aside className="md:hidden">{summary}</aside>
    </div>
  );
};

export const CheckoutWrapperLoader = () => {
  return (
    <div className="gap-8y grid grid-cols-1">
      <div className="flex flex-col items-center justify-center gap-8">
        <Spinner />
      </div>
    </div>
  );
};
