"use client";

import { createContext, useContext, type ComponentProps, type ReactNode } from "react";

type LinkComponent = React.ComponentType<
    ComponentProps<"a"> & { href: string }
>;
type RouterHook = () => {
    push: (href: string) => void;
    replace: (href: string) => void;
    refresh: () => void;
    back: () => void;
    forward: () => void;
};
type PathnameHook = () => string;

type LocalizedLinkContextValue = {
    LocalizedLink: LinkComponent;
    useRouter: RouterHook;
    usePathname: PathnameHook;
};

const LocalizedLinkContext = createContext<LocalizedLinkContextValue | null>(
    null,
);

type LocalizedLinkProviderProps = {
    children: ReactNode;
    LocalizedLink: LinkComponent;
    useRouter: RouterHook;
    usePathname: PathnameHook;
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

