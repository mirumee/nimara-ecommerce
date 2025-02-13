export const isObject = (obj: object) => obj.constructor.name === "Object";

export const isEmptyObject = (obj: object) =>
  obj.constructor.name === "Object" && Object.keys(obj).length === 0;

export const all = <T>(values: (T | null | undefined)[]): values is T[] =>
  values.every((value): value is T => value !== null && value !== undefined);

export const any = <T>(values: (T | null | undefined)[]) =>
  values.some((value): value is T => value !== null && value !== undefined);
