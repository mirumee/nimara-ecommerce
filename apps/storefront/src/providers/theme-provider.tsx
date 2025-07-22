"use client";

import { ThemeProvider } from "next-themes";
import { useEffect, useState } from "react";

export function ClientThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = () => setPrefersReducedMotion(mediaQuery.matches);

    mediaQuery.addEventListener("change", handleChange);

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange={prefersReducedMotion}
    >
      {children}
    </ThemeProvider>
  );
}
