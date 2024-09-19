"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export const useRouterWithState = () => {
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  const push = (href: string, options?: { scroll?: boolean }) => {
    setIsRedirecting(true);
    router.push(href, options);

    return;
  };

  const replace = (href: string, options?: { scroll?: boolean }) => {
    setIsRedirecting(true);
    router.replace(href, options);

    return;
  };

  useEffect(() => {
    return () => setIsRedirecting(false);
  }, []);

  return { isRedirecting, push, replace };
};
