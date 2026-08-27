import { Suspense, useCallback, useState } from "react";

import { ErrorBoundary } from "@nimara/lib/client/components/error-boundary";
import { Spinner } from "@nimara/lib/client/components/spinner";
import { useDashboardSession } from "@nimara/lib/client/dashboard-session/context";

import { fetchSettings } from "./api";
import { SettingsFields } from "./settings-fields";

export const SettingsForm = () => {
  const { accessToken, saleorApiUrl } = useDashboardSession();
  const [{ formKey, getSettings }, setState] = useState(() => ({
    // Bumped on reload to remount the form, so it re-reads the saved values.
    formKey: 0,
    getSettings: fetchSettings({ accessToken, saleorApiUrl }),
  }));

  const reload = useCallback(
    () =>
      setState((current) => ({
        formKey: current.formKey + 1,
        getSettings: fetchSettings({ accessToken, saleorApiUrl }),
      })),
    [accessToken, saleorApiUrl],
  );

  return (
    <ErrorBoundary title="Settings unavailable">
      <Suspense fallback={<Spinner />}>
        <SettingsFields
          getSettings={getSettings}
          key={formKey}
          reload={reload}
        />
      </Suspense>
    </ErrorBoundary>
  );
};
