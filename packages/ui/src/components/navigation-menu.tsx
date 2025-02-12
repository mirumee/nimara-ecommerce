import * as NavigationMenuPrimitive from "@radix-ui/react-navigation-menu";
import { cva } from "class-variance-authority";
import { ChevronDown } from "lucide-react";
import * as React from "react";

import { cn } from "../lib/utils";

const NavigationMenu = ({
  className,
  children,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Root>) => (
  <NavigationMenuPrimitive.Root
    className={cn(
      "relative z-10 flex max-w-max flex-1 items-center justify-center",
      className,
    )}
    {...props}
  >
    {children}
    <NavigationMenuViewport />
  </NavigationMenuPrimitive.Root>
);

NavigationMenu.displayName = NavigationMenuPrimitive.Root.displayName;

const NavigationMenuList = ({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.List>) => (
  <NavigationMenuPrimitive.List
    className={cn(
      "group flex flex-1 list-none items-center justify-center space-x-1",
      className,
    )}
    {...props}
  />
);

NavigationMenuList.displayName = NavigationMenuPrimitive.List.displayName;

const NavigationMenuItem = NavigationMenuPrimitive.Item;

interface NavigationMenuTriggerProps
  extends React.ComponentProps<typeof NavigationMenuPrimitive.Trigger> {
  showIcon?: boolean;
}

const navigationMenuTriggerStyle = cva(
  "group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50",
);

const NavigationMenuTrigger = ({
  className,
  children,
  showIcon = true,
  ...props
}: NavigationMenuTriggerProps) => (
  <NavigationMenuPrimitive.Trigger
    className={cn(navigationMenuTriggerStyle(), "group", className)}
    {...props}
  >
    {children}{" "}
    {showIcon && (
      <ChevronDown
        className="relative top-[1px] ml-1 h-3 w-3 transition duration-200 group-data-[state=open]:rotate-180"
        aria-hidden="true"
      />
    )}
  </NavigationMenuPrimitive.Trigger>
);

NavigationMenuTrigger.displayName = NavigationMenuPrimitive.Trigger.displayName;

const NavigationMenuContent = ({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Content>) => (
  <NavigationMenuPrimitive.Content
    className={cn(
      "data-[motion^=from-]:animate-in data-[motion^=to-]:animate-out data-[motion^=from-]:fade-in data-[motion^=to-]:fade-out data-[motion=from-end]:slide-in-from-right-52 data-[motion=from-start]:slide-in-from-left-52 data-[motion=to-end]:slide-out-to-right-52 data-[motion=to-start]:slide-out-to-left-52 left-0 top-0 w-full md:absolute md:w-auto",
      className,
    )}
    {...props}
  />
);

NavigationMenuContent.displayName = NavigationMenuPrimitive.Content.displayName;

const NavigationMenuLink = NavigationMenuPrimitive.Link;

const NavigationMenuViewport = ({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Viewport>) => (
  <div className={cn("center absolute top-full flex w-full justify-center")}>
    <NavigationMenuPrimitive.Viewport
      /* Removed `data-[state=open]:animate-in` and `data-[state=closed]:animate-out` to fix menu content jittering during animation transitions.
      This is based on the GitHub issue: https://github.com/shadcn-ui/ui/issues/1351.*/
      className={cn(
        "origin-top-center bg-popover text-popover-foreground data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-90 relative mt-1.5 h-[var(--radix-navigation-menu-viewport-height)] w-full max-w-screen-lg overflow-hidden rounded-md shadow-2xl",
        className,
      )}
      {...props}
    />
  </div>
);

NavigationMenuViewport.displayName =
  NavigationMenuPrimitive.Viewport.displayName;

const NavigationMenuIndicator = ({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Indicator>) => (
  <NavigationMenuPrimitive.Indicator
    className={cn(
      "data-[state=visible]:animate-in data-[state=hidden]:animate-out data-[state=hidden]:fade-out data-[state=visible]:fade-in top-full z-[1] flex h-1.5 items-end justify-center overflow-hidden",
      className,
    )}
    {...props}
  >
    <div className="bg-border relative top-[60%] h-2 w-2 rotate-45 rounded-tl-sm shadow-md" />
  </NavigationMenuPrimitive.Indicator>
);

NavigationMenuIndicator.displayName =
  NavigationMenuPrimitive.Indicator.displayName;

export {
  navigationMenuTriggerStyle,
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuContent,
  NavigationMenuTrigger,
  NavigationMenuLink,
  NavigationMenuIndicator,
  NavigationMenuViewport,
};
