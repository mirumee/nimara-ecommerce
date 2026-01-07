import { type FieldPath, type FieldValues } from "react-hook-form";

export const generateFieldPrefix =
  <V extends FieldValues>(schemaPrefix: string | undefined) =>
  (name: string) =>
    (schemaPrefix ? `${schemaPrefix}.${name}` : name) as FieldPath<V>;
