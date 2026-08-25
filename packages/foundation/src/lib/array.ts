export const all = <T>(values: (T | null | undefined)[]) =>
  values.every((value): value is T => !!value);
