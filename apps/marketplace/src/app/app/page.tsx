"use client";

import { useAuth } from "@/providers/auth-provider";

import { AppPageClient } from "./_components/app-page-client";

export default function AppPage() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-muted/20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return <AppPageClient />;
}
