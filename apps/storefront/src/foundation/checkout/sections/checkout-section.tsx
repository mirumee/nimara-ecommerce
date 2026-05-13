"use client";

import { CheckCircle2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { type PropsWithChildren } from "react";

import { LocalizedLink } from "@nimara/i18n/routing";
import { CardContent, CardHeader } from "@nimara/ui/components/card";
import { cn } from "@nimara/ui/lib/utils";

import { type CheckoutStep } from "@/foundation/checkout/steps";
import { paths } from "@/foundation/routing/paths";

interface Props {
  collapsedSummary?: React.ReactNode;
  disabled?: boolean;
  isComplete: boolean;
  isOpen: boolean;
  step: CheckoutStep;
  title: string;
}

export const CheckoutSection = ({
  step,
  title,
  children,
  isOpen,
  isComplete,
  collapsedSummary,
  disabled,
}: PropsWithChildren<Props>) => {
  return (
    <>
      <LocalizedLink
        href={disabled ? "#" : paths.checkout.asPath({ query: { step } })}
        className={cn({
          "pointer-events-none": disabled,
        })}
      >
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <h2
            className={cn("text-xl tracking-tight", {
              "text-muted-foreground": disabled,
            })}
          >
            {title}
          </h2>
          <CheckCircle2
            className={cn(
              "h-5 w-5",
              isComplete ? "text-green-500" : "text-gray-400",
            )}
          />
        </CardHeader>
      </LocalizedLink>

      <AnimatePresence initial={false}>
        {isOpen ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            key={step}
          >
            <CardContent>{children}</CardContent>
          </motion.div>
        ) : (
          collapsedSummary && <CardContent>{collapsedSummary}</CardContent>
        )}
      </AnimatePresence>
    </>
  );
};
