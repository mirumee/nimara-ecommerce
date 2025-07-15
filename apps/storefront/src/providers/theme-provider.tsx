"use client";

import { ThemeProvider } from "next-themes";
import { useEffect, useState } from "react";

export function ClientThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // This ensures ThemeProvider only renders on the client after mount, so SSR doesn't guess the theme and cause hydration mismatch
  if (!mounted) {
    return null;
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
    </ThemeProvider>
  );
}
