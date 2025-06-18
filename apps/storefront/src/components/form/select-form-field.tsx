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
            key={field.value}
            onValueChange={(value) => {
              field.onChange(value);
              onChange?.(value);
            }}
            defaultValue={field.value}
          >
            <FormControl>
              <SelectTrigger aria-label={label} error={fieldState.invalid}>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {options?.map(({ value, label }) => (
                <SelectItem key={value} value={value}>
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
