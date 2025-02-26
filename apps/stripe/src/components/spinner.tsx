import { type ComponentProps } from "react";

import { Spinner as BaseSpinner } from "@nimara/ui/components/spinner";
import { cn } from "@nimara/ui/lib/utils";

export const Spinner = ({
  className,
  ...props
}: ComponentProps<typeof BaseSpinner>) => (
  <BaseSpinner
    className={cn("mx-auto my-24 h-14 w-14", className)}
    {...props}
  />
);
