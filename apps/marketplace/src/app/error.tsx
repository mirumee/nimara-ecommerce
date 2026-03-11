"use client";

import { useEffect } from "react";

import { Button } from "@nimara/ui/components/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-4xl font-bold">Something went wrong</h1>
      <p className="mt-2 text-muted-foreground">
        An unexpected error occurred.
      </p>
      <Button onClick={() => reset()} className="mt-6">
        Try again
      </Button>
    </div>
  );
}
