"use client";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useFormContext,
} from "@nimara/ui/components/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@nimara/ui/components/select";

import type { SelectOptions } from "./types";

export interface SelectFormFieldProps {
  autoComplete?: string;
  isRequired?: boolean;
  label: string;
  name: string;
  onChange?: (value: string) => void;
  options?: SelectOptions;
  placeholder?: string;
}

export const SelectFormField = ({
  label,
  name,
  isRequired = false,
  placeholder,
  onChange,
  options,
  autoComplete,
}: SelectFormFieldProps) => {
  const { control } = useFormContext();

  return (
    <FormField
      key={name}
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem className="flex-1">
          <FormLabel>
            {label}
            {isRequired && "*"}
          </FormLabel>
          <Select
            name={name}
            autoComplete={autoComplete}
            value={field.value || undefined}
            onValueChange={(value) => {
              if (!value || value === field.value) {
                return;
              }

              field.onChange(value);
              onChange?.(value);
            }}
          >
            <FormControl>
              <SelectTrigger error={fieldState.invalid} aria-label={label}>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {options?.map(({ value, label }, index) => (
                <SelectItem key={`${value}-${index}`} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
