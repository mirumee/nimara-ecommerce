import { Badge } from "@nimara/ui/components/badge";

import { ConfigForm } from "./config-form";

export const AppView = () => {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8 p-8">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Stripe</h1>
        </div>
        <Badge variant="outline">v{window.env.VERSION}</Badge>
      </header>
      <ConfigForm />
    </div>
  );
};
