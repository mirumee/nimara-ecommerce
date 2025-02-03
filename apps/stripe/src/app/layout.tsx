import "@nimara/ui/styles/globals";

import { Toaster } from "@nimara/ui/components/toaster";

import { SaleorAppBridgeInitializer } from "@/components/saleor-app-bridge-initializer";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="container">
          <SaleorAppBridgeInitializer>{children}</SaleorAppBridgeInitializer>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
