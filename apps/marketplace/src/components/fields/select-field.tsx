"use client";

import { Check, ChevronDown } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Controller, useFormContext } from "react-hook-form";

import { Input } from "@nimara/ui/components/input";
import { Label } from "@nimara/ui/components/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@nimara/ui/components/popover";
import { ScrollArea } from "@nimara/ui/components/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@nimara/ui/components/select";

import { DeletableChip } from "@/components/ui/deletable-chip";
import { cn } from "@/lib/utils";

function getErrorAtPath(errors: unknown, path: string): unknown {
  if (!errors || typeof errors !== "object") {
    return undefined;
  }

  return path.split(".").reduce<unknown>((acc, key) => {
    if (!acc || typeof acc !== "object") {
      return undefined;
    }

    return (acc as Record<string, unknown>)[key];
  }, errors);
}

export type SelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

type SelectFieldProps = {
  name: string;
  label?: string;
  options: SelectOption[];
  placeholder?: string;
  description?: string;
  disabled?: boolean;
  isMulti?: boolean;
  loadOptions?: (search: string) => Promise<SelectOption[]>;
  searchPlaceholder?: string;
  emptyStateText?: string;
};

export function SelectField({
  name,
  label,
  options,
  placeholder,
  description,
  disabled,
  isMulti,
  loadOptions,
  searchPlaceholder,
  emptyStateText = "No options found.",
}: SelectFieldProps) {
  const {
    control,
    formState,
    formState: { errors },
  } = useFormContext();

  const error = getErrorAtPath(errors, name) as { message?: unknown } | undefined;

  const [searchQuery, setSearchQuery] = useState("");
  const [availableOptions, setAvailableOptions] = useState<SelectOption[]>(options);
  const [searching, setSearching] = useState(false);
  const searchRequestRef = useRef(0);

  useEffect(() => {
    if (!isMulti || loadOptions) {
      return;
    }

    const normalized = searchQuery.toLowerCase();
    setAvailableOptions(
      options.filter((option) => option.label.toLowerCase().includes(normalized)),
    );
  }, [isMulti, loadOptions, options, searchQuery]);

  useEffect(() => {
    if (!isMulti || !loadOptions) {
      return;
    }

    const requestId = ++searchRequestRef.current;
    setSearching(true);
    loadOptions(searchQuery)
      .then((result) => {
        if (requestId === searchRequestRef.current) {
          setAvailableOptions(result);
        }
      })
      .catch(() => {
        if (requestId === searchRequestRef.current) {
          setAvailableOptions([]);
        }
      })
      .finally(() => {
        if (requestId === searchRequestRef.current) {
          setSearching(false);
        }
      });
  }, [isMulti, loadOptions, searchQuery]);

  useEffect(() => {
    if (!isMulti || loadOptions) {
      return;
    }
    setAvailableOptions(options);
  }, [isMulti, loadOptions, options]);

  const optionLookup = useMemo(() => {
    const map = new Map<string, string>();
    [...options, ...availableOptions].forEach((option) => {
      map.set(option.value, option.label);
    });
    return map;
  }, [availableOptions, options]);

  const placeholderText = placeholder ?? (label ? `Select a ${label.toLowerCase()}` : "Select...");

  const renderBadges = useCallback(
    (selected: SelectOption[], removeOption: (option: SelectOption) => void) => {
      if (!selected.length) {
        return <span className="text-muted-foreground">{placeholderText}</span>;
      }

      return (
        <div className="flex flex-wrap gap-1">
          {selected.map((opt) => (
            <DeletableChip
              key={opt.value}
              label={opt.label || optionLookup.get(opt.value) || opt.value}
              onDelete={() => removeOption(opt)}
            />
          ))}
        </div>
      );
    },
    [optionLookup, placeholderText],
  );

  const renderMultiField = useCallback(
    (field: {
      value: SelectOption[] | undefined;
      onChange: (value: SelectOption[]) => void;
    }) => {
      const rawSelected = Array.isArray(field.value) ? field.value : [];

      // Deduplicate selected options by value
      const selectedMap = new Map<string, SelectOption>();
      for (const opt of rawSelected) {
        if (opt?.value) {
          selectedMap.set(opt.value, opt);
        }
      }
      const selectedOptions = Array.from(selectedMap.values()).map((opt) => ({
        ...opt,
        label: opt.label || optionLookup.get(opt.value) || opt.value,
      }));

      const isOptionSelected = (opt: SelectOption) =>
        selectedMap.has(opt.value) || selectedOptions.some((s) => s.value === opt.value);

      const toggleValue = (opt: SelectOption) => {
        if (isOptionSelected(opt)) {
          field.onChange(selectedOptions.filter((s) => s.value !== opt.value));
        } else {
          field.onChange([
            ...selectedOptions,
            { value: opt.value, label: opt.label || optionLookup.get(opt.value) || opt.value },
          ]);
        }
      };

      const removeValue = (opt: SelectOption) => {
        field.onChange(selectedOptions.filter((s) => s.value !== opt.value));
      };

      const isDisabled =
        disabled || formState.isSubmitting || formState.disabled;

      return (
        <div className="grid gap-2">
          {label ? <Label>{label}</Label> : null}
          <Popover>
            <PopoverTrigger asChild>
              <div
                role="button"
                tabIndex={isDisabled ? -1 : 0}
                aria-disabled={isDisabled}
                className={cn(
                  "border-input bg-background flex min-h-10 w-full items-center justify-between rounded-md border px-3 py-2 text-sm",
                  isDisabled && "cursor-not-allowed opacity-50",
                  error && "border-destructive focus-visible:ring-destructive",
                )}
                onKeyDown={(e) => {
                  if (isDisabled) return;
                  if (e.key === "Enter" || e.key === " ") {
                    // Let Radix PopoverTrigger handle the click semantics; this is only for div focus.
                    e.preventDefault();
                    (e.currentTarget as HTMLDivElement).click();
                  }
                }}
              >
                <div className="flex grow flex-wrap gap-1 text-left">
                  {renderBadges(selectedOptions, removeValue)}
                </div>
                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
              <div className="p-2">
                <Input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder={
                    searchPlaceholder ?? (label ? `Search ${label.toLowerCase()}` : "Search")
                  }
                />
              </div>
              <ScrollArea className="max-h-60">
                {searching ? (
                  <div className="text-muted-foreground p-4 text-sm">Searching…</div>
                ) : availableOptions.length ? (
                  <div className="flex flex-col">
                    {availableOptions
                      .filter((opt) => !isOptionSelected(opt))
                      .map((opt) => {
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          className={cn(
                            "hover:bg-muted flex items-center justify-between px-3 py-2 text-left text-sm",
                          )}
                          onClick={() => toggleValue(opt)}
                        >
                          <span>{opt.label}</span>
                          <Check className="h-4 w-4 opacity-0" />
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-muted-foreground p-4 text-sm">{emptyStateText}</div>
                )}
              </ScrollArea>
            </PopoverContent>
          </Popover>

          {description && !error ? (
            <p className="text-sm text-muted-foreground">{description}</p>
          ) : null}
          {error ? (
            <p className="text-sm text-destructive">{String(error.message ?? "")}</p>
          ) : null}
        </div>
      );
    },
    [
      availableOptions,
      description,
      disabled,
      emptyStateText,
      error,
      formState.disabled,
      formState.isSubmitting,
      label,
      optionLookup,
      renderBadges,
      searchPlaceholder,
      searchQuery,
      searching,
    ],
  );

  return (
    <div className="grid gap-2">
      <Controller
        control={control}
        name={name}
        render={({ field }) =>
          isMulti ? (
            renderMultiField(
              field as unknown as {
                value: SelectOption[] | undefined;
                onChange: (value: SelectOption[]) => void;
              },
            )
          ) : (
            <>
              {label ? <Label htmlFor={name}>{label}</Label> : null}
              <Select
                value={(field.value as string | undefined) ?? ""}
                onValueChange={field.onChange}
                disabled={disabled}
              >
                <SelectTrigger
                  id={name}
                  className={cn(error && "border-destructive focus-visible:ring-destructive")}
                >
                  <SelectValue placeholder={placeholderText} />
                </SelectTrigger>
                <SelectContent>
                  {options.map((o) => (
                    <SelectItem key={o.value} value={o.value} disabled={o.disabled}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {description && !error ? (
                <p className="text-sm text-muted-foreground">{description}</p>
              ) : null}
              {error ? (
                <p className="text-sm text-destructive">{String(error.message ?? "")}</p>
              ) : null}
            </>
          )
        }
      />
    </div>
  );
}
