"use client";

import { Spinner } from "@nimara/ui/components/spinner";

/** Matches checkout main area (`bg-muted`) so brief RSC aborts do not flash a white error screen. */
export function RscStreamInterruptedFallback() {
  return (
    <div className="flex min-h-[60vh] w-full items-center justify-center bg-muted py-8">
      <Spinner className="size-8" />
    </div>
  );
}
