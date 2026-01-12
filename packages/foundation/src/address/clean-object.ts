export const cleanObject = <T extends Record<string, unknown>>(obj: T) =>
  Object.fromEntries(
    Object.entries(obj).filter(([, value]) => value != null && value !== ""),
  ) as T;
