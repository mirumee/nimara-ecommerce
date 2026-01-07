/**
 * Utility type for making the array non-empty.
 */
// TODO this is used in one file maybe should be named as it is named, and be in some utils types
export type NonEmptyArray<T> = [T, ...T[]];
