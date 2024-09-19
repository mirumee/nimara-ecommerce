"use client";

import type { PropsWithChildren, ReactNode } from "react";

import { cn } from "../lib/utils";
import { Input, type InputProps } from "./input";

type ComboboxOption = {
  id: string;
  label: string;
  slug?: string;
};

type ComboboxGroupProps = {
  expanded: boolean;
};

const ComboboxEmpty = ({ children }: PropsWithChildren) => (
  <div className="border-input bg-background absolute mt-1 grid w-full rounded border p-2 text-sm">
    <li className={cn("flex gap-2 text-clip rounded px-1.5 py-2")}>
      {children}
    </li>
  </div>
);

const ComboboxItem = ({
  isSelected,
  children,
}: PropsWithChildren<{ isSelected: boolean }>) => (
  <li
    aria-selected={isSelected ? "true" : "false"}
    className={cn("hover:bg-input text-clip rounded", {
      "ring-2 ring-offset-2": isSelected,
    })}
    role="option"
  >
    {children}
  </li>
);

const ComboboxGroup = ({
  ariaLabel,
  children,
  expanded,
}: PropsWithChildren<ComboboxGroupProps> & { ariaLabel?: string }) => {
  if (!expanded) {
    return null;
  }

  return (
    <div className="border-input bg-background absolute mt-1 grid w-full rounded border p-0.5 text-sm">
      <ul
        aria-expanded={expanded ? "true" : "false"}
        aria-label={ariaLabel}
        id="suggestions-listbox"
        role="listbox"
      >
        {children}
      </ul>
    </div>
  );
};

const ComboboxInput = ({
  inputProps,
  endAdornment,
  expanded,
}: {
  endAdornment?: ReactNode;
  expanded?: boolean;
  inputProps?: InputProps;
}) => (
  <div className="relative">
    <Input
      aria-autocomplete="list"
      aria-controls="suggestions-listbox"
      aria-label={inputProps?.placeholder}
      autoCapitalize="false"
      autoComplete="off"
      autoCorrect="false"
      className={cn({ "pr-12": endAdornment })}
      inputMode="search"
      name="query"
      role="combobox"
      type="search"
      aria-expanded={expanded ? "true" : "false"}
      {...inputProps}
    />

    {endAdornment && (
      <span className="absolute bottom-0 right-0 top-0 flex items-center">
        {endAdornment}
      </span>
    )}
  </div>
);

const Combobox = ({
  children,
  className,
}: PropsWithChildren & { className?: string }) => (
  <div className={cn("relative", className)}>{children}</div>
);

export {
  Combobox,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  type ComboboxOption,
};
