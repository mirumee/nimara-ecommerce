"use client";

import {
  SelectField,
  type SelectOption,
} from "@/components/fields/select-field";

export function CollectionsField({
  name,
  label,
  options,
  disabled,
  description,
  placeholder,
}: {
  description?: string;
  disabled?: boolean;
  label: string;
  name: string;
  options: SelectOption[];
  placeholder?: string;
}) {
  return (
    <SelectField
      name={name}
      label={label}
      options={options}
      isMulti
      disabled={disabled}
      description={description}
      placeholder={placeholder}
    />
  );
}
