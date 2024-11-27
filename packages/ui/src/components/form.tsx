"use client";

import type * as LabelPrimitive from "@radix-ui/react-label";
import { Slot } from "@radix-ui/react-slot";
import * as React from "react";
import { type HTMLProps, type PropsWithChildren } from "react";
import {
  Controller,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
  FormProvider,
  useFormContext,
} from "react-hook-form";

import { cn } from "../lib/utils";
import { Input } from "./input";
import { Label } from "./label";

const Form = FormProvider;

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName;
};

const FormFieldContext = React.createContext<FormFieldContextValue>(
  {} as FormFieldContextValue,
);

const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
};

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);
  const { getFieldState, formState } = useFormContext();

  const fieldState = getFieldState(fieldContext.name, formState);

  if (!fieldContext) {
    throw new Error("useFormField should be used within <FormField>");
  }

  const { id } = itemContext;

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  };
};

type FormItemContextValue = {
  id: string;
};

const FormItemContext = React.createContext<FormItemContextValue>(
  {} as FormItemContextValue,
);

const FormItem = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  const id = React.useId();

  return (
    <FormItemContext.Provider value={{ id }}>
      <div className={cn("space-y-2", className)} {...props} />
    </FormItemContext.Provider>
  );
};

FormItem.displayName = "FormItem";

const FormLabel = ({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) => {
  const { formItemId } = useFormField();

  return <Label className={className} htmlFor={formItemId} {...props} />;
};

FormLabel.displayName = "FormLabel";

const FormControl = ({ ...props }: React.ComponentProps<typeof Slot>) => {
  const { error, formItemId, formDescriptionId, formMessageId } =
    useFormField();

  return (
    <Slot
      id={formItemId}
      aria-describedby={
        !error
          ? `${formDescriptionId}`
          : `${formDescriptionId} ${formMessageId}`
      }
      aria-invalid={!!error}
      {...props}
    />
  );
};

FormControl.displayName = "FormControl";

const FormDescription = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) => {
  const { formDescriptionId } = useFormField();

  return (
    <p
      id={formDescriptionId}
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
};

FormDescription.displayName = "FormDescription";

const FormMessage = ({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) => {
  const { error, formMessageId } = useFormField();
  const body = error ? String(error?.message) : children;

  if (!body) {
    return null;
  }

  return (
    <p
      id={formMessageId}
      className={cn("text-destructive text-sm font-medium", className)}
      {...props}
    >
      {body}
    </p>
  );
};

FormMessage.displayName = "FormMessage";

type FormFileFieldProps = {
  inputProps: HTMLProps<Omit<HTMLInputElement, "name" | "type">> & {
    error?: boolean;
    name: string;
  };
};

/**
 * A form field used to upload files. Must be used within form context.
 * @example
 * Here's an example with just text
 * ```tsx
 * <FormFileField inputProps={{ name: "report-file" }}>
 *   Upload your report
 * </FormFileField>
 * ```
 * @example
 * Here's an example with text and icon
 * ```tsx
 * <FormFileField inputProps={{ name: "report-file" }}>
 *   <div className="flex gap-4">
 *     <SomeIcon />
 *     <span>Upload your report</span>
 *   </div>
 * </FormFileField>
 * ```
 **/
const FormFileField = ({
  children,
  inputProps,
}: PropsWithChildren<FormFileFieldProps>) => {
  const inputFileRef = React.useRef<HTMLInputElement | null>(null);
  const { register } = useFormContext();
  const { ref, ...registerProps } = register(inputProps.name);

  return (
    <FormItem>
      <FormLabel>
        <span onClick={() => inputFileRef.current?.click()}>{children}</span>
        <Input
          {...inputProps}
          {...registerProps}
          type="file"
          className="hidden"
          ref={(e) => {
            ref(e);
            inputFileRef.current = e;
          }}
        />
        <FormMessage />
      </FormLabel>
    </FormItem>
  );
};

FormFileField.displayName = "FormFileField";

export {
  useFormContext,
  useFormField,
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
  FormFileField,
};
