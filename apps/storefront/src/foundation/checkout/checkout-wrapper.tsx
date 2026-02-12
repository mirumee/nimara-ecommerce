import { type PropsWithChildren } from "react";

import { Logo } from "@/features/header/logo";

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
    <section className="min-h-screen overflow-x-clip">
      <div className="mx-auto grid min-h-screen max-w-screen-lg grid-cols-1 md:grid-cols-[3fr_2fr]">
        <div className="relative">
          <div className="absolute inset-y-0 -left-[100vw] right-0 hidden bg-white dark:bg-stone-900 md:block" />
          <main className="relative w-full max-w-md space-y-4 p-4">
            <div className="flex w-full">
              <Logo />
            </div>
          </main>
        </div>
        <aside className="relative hidden bg-gray-100 dark:bg-stone-900 md:block">
          <div className="absolute inset-y-0 -right-[100vw] left-0 bg-gray-100 dark:bg-stone-900" />
          <div className="relative">
            <div className="h-24 w-full" />
          </div>
        </aside>
        <aside className="pt-4 md:hidden">
          <div className="h-24 w-full" />
        </aside>
      </div>
    </section>
  );
};
