import { Suspense, useCallback, useState } from "react";

import { ErrorBoundary } from "@nimara/lib/client/components/error-boundary";
import { Spinner } from "@nimara/lib/client/components/spinner";
import { useDashboardSession } from "@nimara/lib/client/saleor/dashboard-session/context";

import { fetchConfigData } from "./api";
import { ConfigFormFields } from "./components/config-form-fields";

export const ConfigForm = () => {
  const { accessToken, saleorApiUrl } = useDashboardSession();
  const [{ formKey, getConfig }, setConfigState] = useState(() => ({
    // Bumped on reload to remount the form, so it re-reads the saved values.
    formKey: 0,
    getConfig: fetchConfigData({ accessToken, saleorApiUrl }),
  }));

  const reload = useCallback(
    () =>
      setConfigState((current) => ({
        formKey: current.formKey + 1,
        getConfig: fetchConfigData({ accessToken, saleorApiUrl }),
      })),
    [accessToken, saleorApiUrl],
  );

  return (
    <ErrorBoundary title="Configuration unavailable">
      <Suspense fallback={<Spinner />}>
        <ConfigFormFields getConfig={getConfig} key={formKey} reload={reload} />
      </Suspense>
    </ErrorBoundary>
  );
};
