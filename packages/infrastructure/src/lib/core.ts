export function pick<T, K extends keyof T>(source: T, keys: K[]): Pick<T, K> {
  const returnValue = {} as Pick<T, K>;

  keys.forEach((k) => {
    returnValue[k] = source[k];
  });

  return returnValue;
}
