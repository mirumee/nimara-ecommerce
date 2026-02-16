"use client";

import { useFormContext } from "react-hook-form";

import { Label } from "@nimara/ui/components/label";

import { Textarea } from "@/components/ui/textarea";
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

interface TextareaFieldProps {
  description?: string;
  label: string;
  name: string;
  textareaProps?: React.TextareaHTMLAttributes<HTMLTextAreaElement>;
}

export function TextareaField({
  name,
  label,
  description,
  textareaProps,
}: TextareaFieldProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  const error = getErrorAtPath(errors, name) as
    | { message?: unknown }
    | undefined;

  return (
    <div className="grid gap-2">
      <Label htmlFor={name}>{label}</Label>
      <Textarea
        id={name}
        {...register(name)}
        {...textareaProps}
        className={cn(
          textareaProps?.className,
          error && "border-destructive focus-visible:ring-destructive",
        )}
      />
      {description && !error && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      {error && (
        <p className="text-sm text-destructive">
          {String(error.message ?? "")}
        </p>
      )}
    </div>
  );
}
