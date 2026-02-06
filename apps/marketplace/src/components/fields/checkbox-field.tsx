"use client";

import { Controller, useFormContext } from "react-hook-form";

import { Checkbox } from "@nimara/ui/components/checkbox";
import { Label } from "@nimara/ui/components/label";

type CheckboxFieldProps = {
  name: string;
  label: string;
  description?: string;
  disabled?: boolean;
};

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

export function CheckboxField({
  name,
  label,
  description,
  disabled,
}: CheckboxFieldProps) {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  const error = getErrorAtPath(errors, name) as { message?: unknown } | undefined;

  return (
    <div className="grid gap-1">
      <div className="flex items-center gap-2">
        <Controller
          control={control}
          name={name}
          render={({ field }) => (
            <Checkbox
              checked={field.value ?? false}
              onCheckedChange={(checked) => field.onChange(checked === true)}
              disabled={disabled}
            />
          )}
        />
        <Label className="leading-none">{label}</Label>
      </div>
      {description && !error && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      {error && (
        <p className="text-sm text-destructive">{String(error.message ?? "")}</p>
      )}
    </div>
  );
}
