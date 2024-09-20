"use client";

import { useEffect, useState } from "react";

import { loggingService } from "@nimara/infrastructure/logging/service";

import { errorService } from "@/services";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  const [traceId, setTraceId] = useState<string | null>(null);

  useEffect(() => {
    loggingService.error("Unexpected error", { error });
    setTraceId(errorService.logError(error));
  }, [error]);

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <h1 className="text-2xl font-bold leading-10 tracking-tight text-neutral-800">
          Something went wrong
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-7 text-neutral-600">
          <code>{error.message}</code>
        </p>
        <p className="mt-6 max-w-2xl text-base leading-7 text-neutral-600">
          <code>Trace id: {traceId}</code>
        </p>
        <button
          className="mt-8 h-10 rounded-md bg-red-500 px-6 font-semibold text-white"
          onClick={() => reset()}
        >
          Try again
        </button>
      </div>
    </div>
  );
}
