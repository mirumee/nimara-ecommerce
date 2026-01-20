"use client";

import {
  type ComponentType,
  createContext,
  type ReactNode,
  useContext,
} from "react";

type LinkComponent = ComponentType<{
  [key: string]: any;
  children?: React.ReactNode;
  href: string;
}>;

type RouterHook = () => {
  back: () => void;
  forward: () => void;
  push: (href: string) => void;
  refresh: () => void;
  replace: (href: string) => void;
};
type PathnameHook = () => string;

type LocalizedLinkContextValue = {
  LocalizedLink: LinkComponent;
  usePathname: PathnameHook;
  useRouter: RouterHook;
};

const LocalizedLinkContext = createContext<LocalizedLinkContextValue | null>(
  null,
);

type LocalizedLinkProviderProps = {
  LocalizedLink: LinkComponent;
  children: ReactNode;
  usePathname: PathnameHook;
  useRouter: RouterHook;
};

export const LocalizedLinkProvider = ({
  children,
  LocalizedLink,
  useRouter,
  usePathname,
}: LocalizedLinkProviderProps) => {
  return (
    <LocalizedLinkContext.Provider
      value={{ LocalizedLink, useRouter, usePathname }}
    >
      {children}
    </LocalizedLinkContext.Provider>
  );
};

export const useLocalizedLink = () => {
  const context = useContext(LocalizedLinkContext);

  if (!context) {
    throw new Error(
      "useLocalizedLink must be used within a LocalizedLinkProvider",
    );
  }

  return context.LocalizedLink;
};

export const useLocalizedRouter = () => {
  const context = useContext(LocalizedLinkContext);

  if (!context) {
    throw new Error(
      "useLocalizedRouter must be used within a LocalizedLinkProvider",
    );
  }

  return context.useRouter();
};

export const useLocalizedPathname = () => {
  const context = useContext(LocalizedLinkContext);

  if (!context) {
    throw new Error(
      "useLocalizedPathname must be used within a LocalizedLinkProvider",
    );
  }

  return context.usePathname();
};
