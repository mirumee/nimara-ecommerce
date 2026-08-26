export const humanize = (value: string) =>
  (value.charAt(0).toUpperCase() + value.slice(1))
    .replaceAll("_", " ")
    .replaceAll("-", " ");
