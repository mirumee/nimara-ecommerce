import { Eye, EyeOff } from "lucide-react";
import * as React from "react";
import { useState } from "react";

import { cn } from "../lib/utils";
import { Button } from "./button";

export interface InputProps extends React.ComponentProps<"input"> {
  error?: boolean;
}

const Input = ({ className, error, type = "text", ...props }: InputProps) => {
  if (type === "password") {
    return <PasswordInput {...props} type={type} error={error} />;
  }

  return (
    <input
      {...props}
      type={type}
      className={cn(
        "border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        error &&
          "border-error bg-destructive/5 autofill:!bg-destructive/5 focus-visible:ring-error dark:border-error dark:bg-destructive/10 dark:autofill:!bg-destructive/10 dark:focus-visible:ring-error",
        className,
      )}
    />
  );
};

Input.displayName = "Input";

const PasswordInput = ({ className, error, ...props }: InputProps) => {
  const [type, setType] = useState<"text" | "password">(
    (props.type = "password"),
  );

  return (
    <div
      className={cn(
        "border-input ring-offset-background has-[input:focus-visible]:ring-ring flex w-full rounded-md border transition-colors has-[input:focus-visible]:ring-2 has-[input:focus-visible]:ring-offset-2",
        error &&
          "border-red-300 bg-red-50 has-[input:focus-visible]:ring-red-300 dark:border-red-600 dark:bg-red-900/30 dark:has-[input:focus-visible]:ring-red-500",
      )}
    >
      <input
        {...props}
        type={type}
        className={cn(
          "bg-background placeholder:text-muted-foreground flex h-10 w-full rounded-md px-3 py-2 text-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
          error &&
            "bg-destructive/5 autofill:!bg-destructive/5 dark:bg-destructive/10 dark:autofill:!bg-destructive/10",
          className,
        )}
        autoComplete="on"
      />
      {!props.disabled && (
        <Button
          variant="ghost"
          size="icon"
          aria-label="Show/hide password"
          onClick={() => setType(type === "password" ? "text" : "password")}
          type="button"
          className={cn(
            "hover:bg-muted",
            error && "hover:bg-destructive/10 dark:hover:bg-destructive/20",
          )}
          tabIndex={-1}
        >
          {type === "password" && <Eye className="h-5 w-5" />}
          {type === "text" && <EyeOff className="h-5 w-5" />}
        </Button>
      )}
    </div>
  );
};

PasswordInput.displayName = "PasswordInput";

export { Input, PasswordInput };
