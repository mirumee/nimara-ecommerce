import { Loader2 } from "lucide-react";

import { cn } from "../lib/utils";

export const Spinner = ({
  size = 40,
  className,
}: {
  className?: string;
  size?: number;
}) => (
  <Loader2
    size={size}
    className={cn("text-muted-foreground animate-spin", className)}
  />
);
