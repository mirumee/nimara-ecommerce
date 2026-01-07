"use client";

import { NuqsAdapter } from "nuqs/adapters/next/app";

export const NuqsWrapper = ({ children }: { children: React.ReactNode }) => {
    return <NuqsAdapter>{children}</NuqsAdapter>;
};
