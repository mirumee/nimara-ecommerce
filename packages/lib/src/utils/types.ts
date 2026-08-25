type Enumerate<
  N extends number,
  Acc extends number[] = [],
> = Acc["length"] extends N
  ? Acc[number]
  : Enumerate<N, [...Acc, Acc["length"]]>;

export type IntRange<F extends number, T extends number> = Exclude<
  Enumerate<T>,
  Enumerate<F>
>;

export type PartialOnly<T, K extends keyof T> = Omit<T, K> &
  Partial<Pick<T, K>>;

export type RequiredOnly<T, K extends keyof T> = Partial<T> & Pick<T, K>;
