import { type ReactNode } from "react";

import { AccountSideMenu } from "@/components/account-menu";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="grid flex-1 grid-cols-12 gap-4 py-8 pt-0 text-stone-900 md:pt-8">
      <div className="col-span-12 md:col-span-3 xl:col-span-2">
        <AccountSideMenu />
      </div>
      <div className="col-span-12 md:col-span-8 lg:col-start-5 xl:col-span-6 xl:col-start-5">
        {children}
      </div>
    </div>
  );
}
