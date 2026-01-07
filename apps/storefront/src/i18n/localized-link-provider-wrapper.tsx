"use client";

import type { ReactNode } from "react";
import { createNavigation } from "next-intl/navigation";
import { LocalizedLinkProvider } from "@nimara/foundation/i18n/hooks/use-localized-link";
import { routing } from "./routing";

const { Link: LocalizedLink, usePathname, useRouter } = createNavigation(routing);

export function LocalizedLinkProviderWrapper({
    children,
}: {
    children: ReactNode;
}) {
    return (
        <LocalizedLinkProvider
            LocalizedLink={LocalizedLink}
            useRouter={useRouter}
            usePathname={usePathname}
        >
            {children}
        </LocalizedLinkProvider>
    );
}

