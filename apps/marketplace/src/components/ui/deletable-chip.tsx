"use client";

import { X } from "lucide-react";

import { Badge } from "@nimara/ui/components/badge";
import { Button } from "@nimara/ui/components/button";

import { cn } from "@/lib/utils";

export function DeletableChip({
  label,
  onDelete,
  className,
}: {
  className?: string;
  label: string;
  onDelete?: () => void;
}) {
  return (
    <Badge
      variant="secondary"
      className={cn("h-min gap-1 pr-1 font-normal", onDelete && "pr-1", className)}
    >
      {label}
      {onDelete && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-5 w-5 rounded-full p-0 hover:bg-transparent"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDelete();
          }}
          aria-label="Remove filter"
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      )}
    </Badge>
  );
}
