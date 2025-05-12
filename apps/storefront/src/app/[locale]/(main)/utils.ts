export const formatSlugToText = (slug: string) => {
  return slug
    .split("-")
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
};

export const capitalize = (str: string) =>
  str.charAt(0).toUpperCase() + str.slice(1);
