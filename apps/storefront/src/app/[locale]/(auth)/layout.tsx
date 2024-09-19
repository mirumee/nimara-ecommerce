import { type ReactNode } from "react";

import { Footer } from "@/components/footer";
import { Logo } from "@/components/header/logo";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen flex-col">
      <div className="container flex-1 sm:max-w-[21rem] md:max-w-[24.5rem] xl:max-w-[25.375rem]">
        <header className="flex py-4">
          <Logo />
        </header>
        <main className="py-8 md:pt-8">{children}</main>
      </div>
      <Footer />
    </div>
  );
}
