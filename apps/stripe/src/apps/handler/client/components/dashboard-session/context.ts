import { createContext, useContext } from "react";

import { invariant } from "@/lib/util";

export type DashboardSession = { accessToken: string; saleorDomain: string };

export const DashboardSessionContext = createContext<DashboardSession | null>(
  null,
);

export const useDashboardSession = () => {
  const session = useContext(DashboardSessionContext);

  invariant(
    session,
    "useDashboardSession used outside of DashboardSessionProvider.",
  );

  return session;
};
