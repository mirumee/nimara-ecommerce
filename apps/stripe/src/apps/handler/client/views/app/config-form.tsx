import { Suspense, useCallback, useState } from "react";

import { useDashboardSession } from "../../components/dashboard-session/context";
import { Spinner } from "../../components/spinner";
import { fetchConfigData } from "./api";
import { ConfigErrorBoundary } from "./components/config-error-boundary";
import { ConfigFormFields } from "./components/config-form-fields";

export const ConfigForm = () => {
  const { accessToken, saleorDomain } = useDashboardSession();
  const [{ formKey, getConfig }, setConfigState] = useState(() => ({
    // Bumped on reload to remount the form, so it re-reads the saved values.
    formKey: 0,
    getConfig: fetchConfigData({ accessToken, saleorDomain }),
  }));

  const reload = useCallback(
    () =>
      setConfigState((current) => ({
        formKey: current.formKey + 1,
        getConfig: fetchConfigData({ accessToken, saleorDomain }),
      })),
    [accessToken, saleorDomain],
  );

  return (
    <ConfigErrorBoundary>
      <Suspense fallback={<Spinner />}>
        <ConfigFormFields getConfig={getConfig} key={formKey} reload={reload} />
      </Suspense>
    </ConfigErrorBoundary>
  );
};
