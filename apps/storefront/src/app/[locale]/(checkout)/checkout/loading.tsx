import { Logo } from "@/components/header/logo";

import { CheckoutSkeleton } from "./_components/checkout-skeleton";

export default function Loading() {
  return (
    <section className="grid min-h-screen grid-cols-[3fr_2fr]">
      <div className="flex justify-center xl:mr-48 xl:justify-end">
        <main className="w-full max-w-md space-y-4 p-4">
          <div className="flex w-full">
            <Logo />
          </div>
          <div className="flex flex-col gap-8 divide-y pt-8"></div>
        </main>
      </div>
      <aside className="hidden bg-gray-100 md:block">
        <CheckoutSkeleton />
      </aside>
    </section>
  );
}
