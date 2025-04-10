export type Maybe<T> = T | null | undefined;

export type QueryOptions = {
  skip?: boolean;
};

/**
 * A utility type that ensures an object type `T` is preserved exactly as defined,
 * without allowing additional properties or removing existing ones.
 *
 * @template T - The object type to enforce exactness on.
 */
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
