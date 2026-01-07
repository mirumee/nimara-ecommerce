import type { ComponentProps } from "react";
import { useFormContext } from "react-hook-form";

import { Checkbox } from "@nimara/ui/components/checkbox";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@nimara/ui/components/form";
import { cn } from "@nimara/ui/lib/utils";

export type CheckboxFieldProps = ComponentProps<typeof Checkbox> & {
  ariaLabel?: string;
  isRequired?: boolean;
  label?: string;
  name: string;
};

export const CheckboxField = ({
  name,
  label,
  ariaLabel,
  isRequired,
  className,
  ...props
}: CheckboxFieldProps) => {
  const { control } = useFormContext();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        return (
          <FormItem className={cn("grid gap-2 py-4", className)}>
            <div className="flex items-center gap-2">
              <FormControl>
                <Checkbox
                  {...props}
                  {...field}
                  checked={!!field.value}
                  onCheckedChange={field.onChange}
                  id={name}
                  aria-label={label || ariaLabel}
                />
              </FormControl>
              <FormLabel htmlFor={name}>
                {label}
                {isRequired && "*"}
              </FormLabel>
            </div>
            <FormMessage />
          </FormItem>
        );
      }}
    ></FormField>
  );
};
