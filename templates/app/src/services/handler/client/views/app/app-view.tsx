import { AppSettingsForm } from "@nimara/lib/client/saleor/components/app-settings-form";
import { Badge } from "@nimara/ui/components/badge";

import { fetchSettings } from "./api";
import { SettingsFields } from "./settings-fields";

export const AppView = () => (
  <div className="mx-auto flex max-w-3xl flex-col gap-8 p-8">
    <header className="flex flex-wrap items-start justify-between gap-3">
      <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
      <Badge variant="outline">v{window.env.VERSION}</Badge>
    </header>
    <AppSettingsForm
      fetchSettings={fetchSettings}
      renderFields={({ reload, settings }) => (
        <SettingsFields reload={reload} settings={settings} />
      )}
    />
  </div>
);
