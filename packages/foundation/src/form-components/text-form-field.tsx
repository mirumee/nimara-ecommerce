"use client";

import { useCallback, useEffect, useRef } from "react";

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
  const { control, setValue, getValues } = useFormContext();
  const { error } = control.getFieldState(name);
  const inputRef = useRef<HTMLInputElement | null>(null);

  /*
    Password managers assign to input.value and then dispatch their own events.
    React's value tracker already recorded that assignment, so its onChange
    never runs and the form keeps the previous value. A native listener sees
    what actually landed in the DOM; trusted events stay with React.
  */
  const handleExternalFill = useCallback(
    (event: Event) => {
      const input = inputRef.current;

      if (event.isTrusted || !input || input.value === getValues(name)) {
        return;
      }

      setValue(name, input.value, { shouldDirty: true, shouldTouch: true });
      onChange?.(input.value);
    },
    [name, onChange, setValue, getValues],
  );

  useEffect(() => {
    const input = inputRef.current;

    input?.addEventListener("input", handleExternalFill);
    input?.addEventListener("change", handleExternalFill);

    return () => {
      input?.removeEventListener("input", handleExternalFill);
      input?.removeEventListener("change", handleExternalFill);
    };
  }, [handleExternalFill]);

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
                  ref={(node) => {
                    field.ref(node);
                    inputRef.current = node;
                  }}
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
