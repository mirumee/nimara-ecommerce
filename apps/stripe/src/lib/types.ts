export type Maybe<T> = T | null | undefined;

export type ParamsOf<T extends (...args: any) => any> = Parameters<T>[0];
