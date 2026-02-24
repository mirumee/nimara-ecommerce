"use client";

import type { ReactNode } from "react";

import { Button } from "@nimara/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@nimara/ui/components/dialog";

export function PickerDialogShell({
  open,
  title,
  onOpenChange,
  children,
  footerLeft,
  primaryLabel,
  onPrimary,
  primaryDisabled,
}: {
  children: ReactNode;
  footerLeft?: ReactNode;
  onOpenChange: (open: boolean) => void;
  onPrimary: () => void;
  open: boolean;
  primaryDisabled?: boolean;
  primaryLabel: string;
  title: string;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        {children}

        <DialogFooter className="flex items-center justify-between sm:justify-between">
          <div className="text-sm text-muted-foreground">{footerLeft}</div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              type="button"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="bg-stone-900 hover:bg-stone-800"
              onClick={onPrimary}
              disabled={primaryDisabled}
            >
              {primaryLabel}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
