"use client";
import { CheckIcon, ChevronDown, XIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { cn } from "../lib/utils";
import { Badge } from "./badge";
import { Button } from "./button";
import { Command, CommandGroup, CommandItem, CommandList } from "./command";
import { Separator } from "./separator";

interface MultiSelectProps {
  className?: string;
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
  className,
}: MultiSelectProps) => {
  const [selectedValues, setSelectedValues] = useState<string[]>(defaultValue);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleOption = (option: string) => {
    setSelectedValues((prev) =>
      prev.includes(option)
        ? prev.filter((v) => v !== option)
        : [...prev, option],
    );
  };

  const handleClear = () => {
    setSelectedValues([]);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          "flex h-auto min-h-10 w-full items-center justify-between rounded-md border bg-inherit p-1 hover:bg-inherit [&_svg]:pointer-events-auto",
          className,
        )}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls="multi-select-dropdown"
      >
        {selectedValues.length > 0 ? (
          <div className="flex w-full items-center justify-between">
            <div className="flex flex-wrap items-center gap-1">
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
                      className="h-4 w-4 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleOption(value);
                      }}
                    />
                  </Badge>
                );
              })}
            </div>
            <div className="flex items-center justify-between">
              <XIcon
                className="text-muted-foreground mx-2 h-4 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClear();
                }}
              />
              <Separator
                orientation="vertical"
                className="flex h-full min-h-6"
              />
              <ChevronDown className="text-muted-foreground mx-2 h-4 cursor-pointer" />
            </div>
          </div>
        ) : (
          <div className="mx-auto flex w-full items-center justify-between">
            <span className="text-muted-foreground mx-3 text-sm">
              {placeholder}
            </span>
            <ChevronDown className="text-muted-foreground mx-2 h-4 cursor-pointer" />
          </div>
        )}
      </Button>

      {isOpen && (
        <div
          className="bg-popover absolute z-50 mt-1 w-full rounded-md border shadow-md"
          id="multi-select-dropdown"
          role="listbox"
          aria-multiselectable="true"
        >
          <Command>
            <CommandList>
              <CommandGroup>
                {options.map((option) => {
                  const isSelected = selectedValues.includes(option.value);

                  return (
                    <CommandItem
                      key={option.value}
                      onSelect={() => toggleOption(option.value)}
                      role="option"
                      aria-selected={isSelected}
                    >
                      <div
                        className={cn(
                          "border-primary mr-2 flex h-4 w-4 items-center justify-center rounded-sm border",
                          isSelected
                            ? "bg-primary text-primary-foreground"
                            : "opacity-50 [&_svg]:invisible",
                        )}
                      >
                        <CheckIcon className="h-4 w-4" />
                      </div>
                      <span>{option.label}</span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </div>
      )}

      {name &&
        (selectedValues.length > 0 ? (
          selectedValues.map((value) => (
            <input key={value} type="hidden" name={name} value={value} />
          ))
        ) : (
          <input type="hidden" name={name} value="" />
        ))}
    </div>
  );
};

MultiSelect.displayName = "MultiSelect";
