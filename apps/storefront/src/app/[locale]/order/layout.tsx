import { type ReactNode } from "react";

import { Logo } from "@/components/header/logo";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="container grid justify-center gap-8">
      <span className="my-6 justify-self-center">
        <Logo />
      </span>
      <main className="flex-1">{children}</main>
    </div>
  );
}
