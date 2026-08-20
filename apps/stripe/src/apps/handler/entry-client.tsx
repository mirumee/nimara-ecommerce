import "@nimara/ui/styles/globals";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { Toaster } from "@nimara/ui/components/toaster";

import { SaleorAppBridgeInitializer } from "./client/components/saleor-app-bridge-initializer";
import { AppView } from "./client/views/app/app-view";

createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <div className="container">
      <SaleorAppBridgeInitializer>
        <AppView />
      </SaleorAppBridgeInitializer>
    </div>
    <Toaster />
  </StrictMode>,
);
