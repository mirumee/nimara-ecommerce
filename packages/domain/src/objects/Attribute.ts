export type AttributeType =
  | "BOOLEAN"
  | "DATE"
  | "DATE_TIME"
  | "DROPDOWN"
  | "FILE"
  | "MULTISELECT"
  | "NUMERIC"
  | "PLAIN_TEXT"
  | "REFERENCE"
  | "RICH_TEXT"
  | "SWATCH";

export type AttributeValue = {
  boolean: boolean;
  date: Date | undefined;
  dateTime: Date | undefined;
  name: string;
  plainText: string;
  reference: string | undefined;
  richText: string;
  slug: string;
  value: string;
};

export type Attribute = {
  name: string;
  slug: string;
  type: AttributeType;
  values: AttributeValue[];
};
