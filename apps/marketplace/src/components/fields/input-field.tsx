"use client";

import { useFormContext } from "react-hook-form";

import { Input } from "@nimara/ui/components/input";
import { Label } from "@nimara/ui/components/label";

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

interface InputFieldProps {
  description?: string;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  label: string;
  name: string;
}

export function InputField({ name, label, description, inputProps }: InputFieldProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  const error = getErrorAtPath(errors, name) as { message?: unknown } | undefined;

  return (
    <div className="grid gap-2">
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        {...register(name)}
        {...inputProps}
        className={cn(
          inputProps?.className,
          error && "border-destructive focus-visible:ring-destructive",
        )}
      />
      {description && !error && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      {error && (
        <p className="text-sm text-destructive">{String(error.message ?? "")}</p>
      )}
    </div>
  );
}
