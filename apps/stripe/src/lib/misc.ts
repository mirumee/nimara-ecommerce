export const isObject = (obj: unknown): obj is object =>
  obj?.constructor?.name === "Object";

export const isEmptyObject = (obj: unknown) =>
  isObject(obj) && Object.keys(obj).length === 0;

export const all = <T>(values: (T | null | undefined)[]) =>
  values.every((value): value is T => !!value);

export const any = <T>(values: (T | null | undefined)[]) =>
  values.some((value): value is T => !!value);
