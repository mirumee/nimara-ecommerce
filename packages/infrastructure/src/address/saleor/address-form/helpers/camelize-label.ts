export const camelizeLabel = (label: string) =>
  label
    .split("")
    .map((word, index) => (index === 0 ? word.toUpperCase() : word))
    .join("")
    .replace("_", " ");
