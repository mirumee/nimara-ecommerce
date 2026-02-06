"use client";

import { SelectField, type SelectOption } from "@/components/fields/select-field";

export function CollectionsField({
  name,
  label,
  options,
  disabled,
  description,
  placeholder,
}: {
  name: string;
  label: string;
  options: SelectOption[];
  disabled?: boolean;
  description?: string;
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
      searchPlaceholder={`Search ${label.toLowerCase()}`}
    />
  );
}

