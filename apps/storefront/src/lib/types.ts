import { type Region } from "@/regions/types";

export type Maybe<T> = T | null | undefined;

export type WithRegion = { region: Region };

export type DeepObjectKeys<T> = T extends object
  ? {
      [K in keyof T]: `${Exclude<K, symbol>}${"" | `.${DeepObjectKeys<T[K]>}`}`;
    }[keyof T]
  : never;
