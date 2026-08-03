"use client";

import { useTheme } from "next-themes";
import { type ComponentProps, type RefObject } from "react";

import { type Maybe } from "@nimara/domain/objects/Maybe";
import { Spinner } from "@nimara/ui/components/spinner";
import { cn } from "@nimara/ui/lib/utils";

import { ActiveSetupElement } from "@/features/payment/providers/active";

type ActiveProps = ComponentProps<typeof ActiveSetupElement>;

type SetupElementProps = {
  initializeData: Maybe<ActiveProps["initializeData"]>;
  isMounted: boolean;
  locale: string;
  methodSession: Maybe<ActiveProps["methodSession"]>;
  onReady: () => void;
  ref: RefObject<unknown>;
};

export const SetupElement = ({
  initializeData,
  isMounted,
  locale,
  methodSession,
  onReady,
  ref,
}: SetupElementProps) => {
  const { resolvedTheme } = useTheme();

  const isDark = resolvedTheme === "dark";
  const spinner = <Spinner className="mx-auto my-16 block" />;

  if (!initializeData || !methodSession) {
    return spinner;
  }

  return (
    <>
      {!isMounted && spinner}

      <ActiveSetupElement
        key={`${methodSession.id}-${resolvedTheme}`}
        appearance={{
          theme: isDark ? "night" : "flat",
          variables: {
            borderRadius: "5px",
          },
        }}
        className={cn({ hidden: !isMounted })}
        initializeData={initializeData}
        locale={locale}
        methodSession={methodSession}
        onReady={onReady}
        ref={ref}
      />
    </>
  );
};
