import { Suspense } from "react";

import { ConfigurationNavClient } from "./_components/configuration-nav-client";
import { ConfigurationSidebarSkeleton } from "./_components/configuration-sidebar-skeleton";
import { ConfigurationSidebarWithVendor } from "./_components/configuration-sidebar-with-vendor";

export default function ConfigurationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="-mx-6 -mt-4 flex min-h-screen">
      <div className="sticky top-[4.5rem] flex h-[calc(100vh-4.5rem)] w-64 flex-col self-start border-r bg-gray-50">
        <Suspense
          fallback={
            <>
              <ConfigurationSidebarSkeleton />
              <ConfigurationNavClient />
            </>
          }
        >
          <ConfigurationSidebarWithVendor />
        </Suspense>
      </div>

      <div className="flex-1 bg-gray-50/30 p-8">
        <div className="mx-auto max-w-4xl">{children}</div>
      </div>
    </div>
  );
}
