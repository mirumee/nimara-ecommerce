"use client";

import { useFormContext } from "react-hook-form";

import { Input } from "@nimara/ui/components/input";
import { Label } from "@nimara/ui/components/label";

import { cn } from "@/lib/utils";

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

  const error = errors[name];

  return (
    <div className="grid gap-2">
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        {...register(name)}
        {...inputProps}
        className={cn(
          inputProps?.className,
          error && "border-destructive focus-visible:ring-destructive"
        )}
      />
      {description && !error && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      {error && (
        <p className="text-sm text-destructive">{error.message as string}</p>
      )}
    </div>
  );
}
