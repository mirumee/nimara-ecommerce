"use client";

import * as ToastPrimitives from "@radix-ui/react-toast";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";
import * as React from "react";

import { cn } from "../lib/utils";

const ToastProvider = ToastPrimitives.Provider;

const ToastViewport: React.FC<
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport> &
    VariantProps<typeof toastPositions>
> = ({ className, position = "right", ...props }) => (
  <ToastPrimitives.Viewport
    className={cn(
      "fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:top-auto sm:flex-col md:max-w-[420px]",
      toastPositions({ position }),
      className,
    )}
    {...props}
  />
);

ToastViewport.displayName = ToastPrimitives.Viewport.displayName;

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full pl-4",
  {
    variants: {
      variant: {
        default: "border bg-background text-foreground",
        destructive:
          "destructive group border-destructive bg-destructive text-destructive-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

const toastPositions = cva("", {
  variants: {
    position: {
      center: "min-w-[390px] sm:left-1/2 sm:-translate-x-1/2",
      right: "sm:right-0",
    },
  },
});

const Toast: React.FC<
  React.ComponentProps<typeof ToastPrimitives.Root> &
    VariantProps<typeof toastVariants>
> = ({ className, variant, ...props }) => {
  return (
    <ToastPrimitives.Root
      className={cn(toastVariants({ variant }), className)}
      {...props}
    />
  );
};

Toast.displayName = ToastPrimitives.Root.displayName;

const ToastAction = ({
  className,
  ...props
}: React.ComponentProps<typeof ToastPrimitives.Action>) => (
  <ToastPrimitives.Action
    className={cn(
      "ring-offset-background hover:bg-secondary focus:ring-ring group-[.destructive]:border-muted/40 group-[.destructive]:hover:border-destructive/30 group-[.destructive]:hover:bg-destructive group-[.destructive]:hover:text-destructive-foreground group-[.destructive]:focus:ring-destructive inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
      className,
    )}
    {...props}
  />
);

ToastAction.displayName = ToastPrimitives.Action.displayName;

const ToastClose = ({
  className,
  ...props
}: React.ComponentProps<typeof ToastPrimitives.Close>) => (
  <ToastPrimitives.Close
    className={cn(
      "text-foreground/50 hover:text-foreground absolute right-2 top-2 rounded-md p-1 opacity-0 transition-opacity focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100 group-[.destructive]:text-red-300 group-[.destructive]:hover:text-red-50 group-[.destructive]:focus:ring-red-400 group-[.destructive]:focus:ring-offset-red-600",
      className,
    )}
    toast-close=""
    {...props}
  >
    <X className="h-4 w-4" />
  </ToastPrimitives.Close>
);

ToastClose.displayName = ToastPrimitives.Close.displayName;

const ToastTitle = ({
  className,
  ...props
}: React.ComponentProps<typeof ToastPrimitives.Title>) => (
  <ToastPrimitives.Title
    className={cn("text-sm font-semibold", className)}
    {...props}
  />
);

ToastTitle.displayName = ToastPrimitives.Title.displayName;

const ToastDescription = ({
  className,
  ...props
}: React.ComponentProps<typeof ToastPrimitives.Description>) => (
  <ToastPrimitives.Description
    className={cn("text-sm opacity-90", className)}
    {...props}
  />
);

ToastDescription.displayName = ToastPrimitives.Description.displayName;

type ToastProps = React.ComponentProps<typeof Toast>;

type ToastActionElement = React.ReactElement<typeof ToastAction>;

export {
  type ToastProps,
  type ToastActionElement,
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
};
