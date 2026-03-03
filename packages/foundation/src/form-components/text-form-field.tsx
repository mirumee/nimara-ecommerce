"use client";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useFormContext,
} from "@nimara/ui/components/form";
import { Input, type InputProps } from "@nimara/ui/components/input";

export interface TextFormFieldProps extends Omit<InputProps, "onChange"> {
  isRequired?: boolean;
  label: string;
  onChange?: (value: string) => void;
}

export function TextFormField({
  label,
  name = "",
  isRequired = false,
  placeholder,
  onChange,
  type,
  ...props
}: TextFormFieldProps) {
  const { control } = useFormContext();
  const { error } = control.getFieldState(name);

  return (
    <FormField
      key={name}
      control={control}
      name={name}
      render={({ field }) => {
        return (
          <FormItem className="flex-1">
            <FormLabel htmlFor={name}>
              {label}
              {isRequired && "*"}
            </FormLabel>
            <FormControl>
              <div className="flex">
                <Input
                  aria-label={label}
                  placeholder={placeholder}
                  {...field}
                  value={field?.value ?? ""}
                  onChange={(e) => {
                    field.onChange(e);
                    onChange?.(e.target.value);
                  }}
                  type={type}
                  error={!!error}
                  {...props}
                />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
