import type { DeepNonNullable, DeepRequired } from "ts-essentials";

import type { Attribute } from "@nimara/domain/objects/Attribute";

import type { SelectionAttributeFragment } from "#root/public/saleor/store/graphql/fragments/generated";

import { getTranslation } from "../saleor";

export const parseAttributeData = (
  data: SelectionAttributeFragment,
): Attribute => {
  const {
    attribute: { inputType, slug, ...attribute },
    values,
  } = data as DeepRequired<DeepNonNullable<SelectionAttributeFragment>>;

  return {
    name: getTranslation("name", attribute),
    type: inputType,
    slug,
    values: values.map(
      ({ slug, boolean, value, date, dateTime, reference, ...choice }) => ({
        slug,
        name: getTranslation("name", choice),
        plainText: getTranslation("plainText", choice),
        richText: getTranslation("richText", choice),
        boolean: !!boolean,
        value,
        reference,
        date: date ? new Date(date) : undefined,
        dateTime: dateTime ? new Date(dateTime) : undefined,
      }),
    ),
  };
};
