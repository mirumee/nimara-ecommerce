import { Logo } from "@/components/header/logo";

import { CheckoutSkeleton } from "./_components/checkout-skeleton";

export default function Loading() {
  return (
    <section className="mx-auto grid w-full max-w-7xl grid-cols-12">
      <main className="col-span-12 w-full space-y-4 justify-self-center px-0 pt-4 xs:px-6 md:col-span-7 md:max-w-md">
        <div className="flex w-full">
          <Logo />
        </div>
        <div className="flex flex-col gap-8 divide-y pt-6"></div>
      </main>
      <aside className="col-span-5 hidden min-h-screen bg-gray-100 pl-12 pr-24 pt-24 md:block">
        <CheckoutSkeleton />
      </aside>
    </section>
  );
}
