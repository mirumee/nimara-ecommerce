"use client";

import { NuqsAdapter } from "nuqs/adapters/next/app";
import { type PropsWithChildren } from "react";

export const NuqsWrapper = ({ children }: PropsWithChildren) => {
  return <NuqsAdapter>{children}</NuqsAdapter>;
};
