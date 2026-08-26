import "@nimara/ui/styles/globals";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { DashboardSessionProvider } from "@nimara/lib/client/components/dashboard-session/provider";
import { Toaster } from "@nimara/ui/components/toaster";

import { AppView } from "./client/views/app/app-view";

createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <div className="min-h-screen bg-background text-foreground">
      <DashboardSessionProvider>
        <AppView />
      </DashboardSessionProvider>
    </div>
    <Toaster />
  </StrictMode>,
);
