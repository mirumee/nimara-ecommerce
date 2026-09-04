import { Badge } from "@nimara/ui/components/badge";

import { SettingsForm } from "./settings-form";

export const AppView = () => (
  <div className="mx-auto flex max-w-3xl flex-col gap-8 p-8">
    <header className="flex flex-wrap items-start justify-between gap-3">
      <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
      <Badge variant="outline">v{window.env.VERSION}</Badge>
    </header>
    <SettingsForm />
  </div>
);
