"use client";

import { createContext, type ReactNode, useContext } from "react";

import type { localizedFormatter } from "./util";

type LocalizedFormatter = ReturnType<typeof localizedFormatter>;

type LocalizedFormatterContextValue = {
  formatter: LocalizedFormatter;
};

const LocalizedFormatterContext =
  createContext<LocalizedFormatterContextValue | null>(null);

type LocalizedFormatterProviderProps = {
  children: ReactNode;
  formatter: LocalizedFormatter;
};

export const LocalizedFormatterProvider = ({
  children,
  formatter,
}: LocalizedFormatterProviderProps) => {
  return (
    <LocalizedFormatterContext.Provider value={{ formatter }}>
      {children}
    </LocalizedFormatterContext.Provider>
  );
};

export const useLocalizedFormatter = () => {
  const context = useContext(LocalizedFormatterContext);

  if (!context) {
    throw new Error(
      "useLocalizedFormatter must be used within a LocalizedFormatterProvider",
    );
  }

  return context.formatter;
};
