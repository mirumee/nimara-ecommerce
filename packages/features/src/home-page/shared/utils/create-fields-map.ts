import type { PageField } from "@nimara/domain/objects/CMSPage";

export type FieldsMap = {
  [key: string]: {
    imageUrl?: string;
    reference?: string[];
    text?: string;
  };
};

export const createFieldsMap = (fields: PageField[]): FieldsMap => {
  return Object.fromEntries(
    fields.map((field) => [
      field.slug,
      {
        text: field.text,
        imageUrl: field.imageUrl,
        reference: field.reference,
      },
    ]),
  );
};
