export type FieldType = "select" | "text" | "email";

export type SelectOptions = {
  label: string;
  value: string;
}[];

export type AddressFormField = {
  isRequired?: boolean;
  isSrOnlyLabel?: boolean;
  label?: string;
  matchers?: string[];
  name: string;
  onChange?: (value: string) => void;
  options?: SelectOptions;
  placeholder?: string;
  type?: FieldType;
};

export type AddressFormRow = AddressFormField[];

export type IsAllowed = (fieldName: string) => boolean;
export type IsRequired = (fieldName: string) => boolean;
