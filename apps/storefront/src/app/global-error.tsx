"use client";

import type Error from "next/error";
import { useEffect, useState } from "react";

import { errorService } from "@/services/error";

export default function GlobalError({ error }: { error: Error }) {
  const [traceId, setTraceId] = useState<string | null>(null);

  useEffect(() => {
    setTraceId(errorService.logError(error));
  }, [error]);

  return (
    <html>
      <body>Error: {traceId}</body>
    </html>
  );
}
