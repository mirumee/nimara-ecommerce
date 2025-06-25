"use client";

import { CheckIcon, ChevronDown, XIcon } from "lucide-react";
import { useMemo, useState } from "react";

import { cn } from "../lib/utils";
import { Badge } from "./badge";
import { Button } from "./button";
import { Command, CommandGroup, CommandItem, CommandList } from "./command";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Separator } from "./separator";

interface MultiSelectProps {
  defaultValue?: string[];
  name?: string;
  options: {
    label: string;
    value: string;
  }[];
  placeholder?: string;
}

export const MultiSelect = ({
  options,
  name,
  defaultValue = [],
  placeholder = "Select options",
}: MultiSelectProps) => {
  const [selectedValues, setSelectedValues] = useState<string[]>(defaultValue);
  const hasSelectedValues = selectedValues.length > 0;

  const toggleOption = (option: string) => {
    setSelectedValues((prev) =>
      prev.includes(option)
        ? prev.filter((v) => v !== option)
        : [...prev, option],
    );
  };

  const valueBadges = useMemo(
    () => (
      <span className="flex flex-wrap items-center gap-1">
        {selectedValues.map((value) => {
          const option = options.find((o) => o.value === value);

          return (
            <Badge
              key={value}
              className="flex items-center gap-2"
              variant="secondary"
            >
              {option?.label}
              <XIcon
                className="h-4 w-4 cursor-pointer opacity-50 hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleOption(value);
                }}
              />
            </Badge>
          );
        })}
      </span>
    ),
    [selectedValues, options],
  );

  return (
    <>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className={cn(
              "ring-offset-background focus:ring-ring h-auto min-h-10 justify-between bg-inherit px-3 py-2 font-thin hover:bg-inherit hover:text-current focus:outline-none focus:ring-2 focus:ring-offset-2",
              { "py-1.5": hasSelectedValues },
            )}
            aria-haspopup="listbox"
            aria-controls="multi-select-dropdown"
          >
            {hasSelectedValues ? valueBadges : placeholder}

            <span className="flex items-center gap-2">
              {hasSelectedValues && (
                <>
                  <XIcon
                    className="h-4 w-4 cursor-pointer opacity-50 hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedValues([]);
                    }}
                  />

                  <Separator className="min-h-4" orientation="vertical" />
                </>
              )}

              <ChevronDown className="text-muted-foreground mx-0 h-4 w-4 cursor-pointer opacity-50" />
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-[--radix-popover-trigger-width] p-0"
          onWheel={(e) => {
            e.stopPropagation();
          }}
        >
          <Command>
            <CommandList>
              <CommandGroup>
                {options.map(({ label, value }) => {
                  const isSelected = selectedValues.includes(value);

                  return (
                    <CommandItem
                      key={value}
                      onSelect={() => toggleOption(value)}
                      role="option"
                      aria-selected={isSelected}
                    >
                      <div
                        className={cn(
                          "border-primary flex h-4 w-4 items-center justify-center rounded-sm border",
                          isSelected
                            ? "bg-primary text-primary-foreground"
                            : "opacity-50 [&_svg]:invisible",
                        )}
                      >
                        <CheckIcon className="h-4 w-4" />
                      </div>
                      <span>{label}</span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {name &&
        (selectedValues.length > 0 ? (
          selectedValues.map((value) => (
            <input key={value} type="hidden" name={name} value={value} />
          ))
        ) : (
          <input type="hidden" name={name} value="" />
        ))}
    </>
  );
};
