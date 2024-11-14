import type { Attribute } from "@nimara/domain/objects/Attribute";

export const getAttributes = (
  attributes: Attribute[] | undefined,
  slugs: string[],
) => {
  if (!attributes) {
    return {};
  }

  return attributes.reduce(
    (acc, attr) => {
      if (attr?.slug && slugs.includes(attr.slug)) {
        acc[attr.slug] = attr;
      }

      return acc;
    },
    {} as { [key: string]: Attribute },
  );
};
