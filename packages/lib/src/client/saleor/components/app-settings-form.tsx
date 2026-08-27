import { type ReactNode, Suspense, use, useCallback, useState } from "react";

import { ErrorBoundary } from "#root/client/components/error-boundary";
import { Spinner } from "#root/client/components/spinner";
import { useDashboardSession } from "#root/client/saleor/dashboard-session/context";

const Fields = <Settings,>({
  getSettings,
  reload,
  renderFields,
}: {
  getSettings: Promise<Settings>;
  reload: () => void;
  renderFields: (opts: { reload: () => void; settings: Settings }) => ReactNode;
}) => <>{renderFields({ reload, settings: use(getSettings) })}</>;

/**
 * Reads the settings and hands them to the app's own fields. `reload` remounts
 * them, so a save is followed by what was stored, not by what was typed.
 */
export const AppSettingsForm = <Settings,>({
  errorTitle = "Settings unavailable",
  fetchSettings,
  renderFields,
}: {
  errorTitle?: string;
  fetchSettings: (opts: {
    accessToken: string;
    saleorApiUrl: string;
  }) => Promise<Settings>;
  renderFields: (opts: { reload: () => void; settings: Settings }) => ReactNode;
}) => {
  const { accessToken, saleorApiUrl } = useDashboardSession();
  const [{ formKey, getSettings }, setState] = useState(() => ({
    formKey: 0,
    getSettings: fetchSettings({ accessToken, saleorApiUrl }),
  }));

  const reload = useCallback(
    () =>
      setState((current) => ({
        formKey: current.formKey + 1,
        getSettings: fetchSettings({ accessToken, saleorApiUrl }),
      })),
    [accessToken, fetchSettings, saleorApiUrl],
  );

  return (
    <ErrorBoundary title={errorTitle}>
      <Suspense fallback={<Spinner />}>
        <Fields
          getSettings={getSettings}
          key={formKey}
          reload={reload}
          renderFields={renderFields}
        />
      </Suspense>
    </ErrorBoundary>
  );
};
