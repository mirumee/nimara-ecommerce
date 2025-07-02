type NonFalsy<T> = T extends false | 0 | "" | null | undefined | 0n ? never : T;

interface Array<T> {
  includes(searchElement: unknown, fromIndex?: number): searchElement is T;
}

interface ReadonlyArray<T> {
  includes(searchElement: unknown, fromIndex?: number): searchElement is T;
}

interface Body {
  json(): Promise<unknown>;
}

interface Array<T> {
  filter(predicate: BooleanConstructor, thisArg?: unknown): NonFalsy<T>[];
}

interface ReadonlyArray<T> {
  filter(predicate: BooleanConstructor, thisArg?: unknown): NonFalsy<T>[];
}

interface ArrayConstructor {
  isArray(arg: unknown): arg is unknown[];
}

interface JSON {
  /**
   * Converts a JavaScript Object Notation (JSON) string into an object.
   * @param text A valid JSON string.
   * @param reviver A function that transforms the results. This function is called for each member of the object.
   * If a member contains nested objects, the nested objects are transformed before the parent object is.
   */
  parse(
    text: string,
    reviver?: (this: unknown, key: string, value: unknown) => unknown,
  ): unknown;
}

interface Set<T> {
  has(value: unknown): value is T;
}

declare module "*.svg" {
  import { type FC, type SVGProps } from "react";
  const content: FC<SVGProps<SVGElement>>;

  export default content;
}

declare module "*.svg?url" {
  const content: any;

  export default content;
}

type Messages = typeof import("./messages/en-US.json");
declare interface IntlMessages extends Messages {}

type Slug = string;
type Id = string;
type RevalidateTag =
  | "ADDRESS_VALIDATION_RULES"
  | "DETAIL-PAGE:COLLECTION"
  | "DETAIL-PAGE:PRODUCT"
  | "SEARCH:FACETS"
  | "SEARCH"
  | `ADDRESS_VALIDATION_RULES:${string}`
  | `CHECKOUT:${Id}`
  | `CMS:${Slug}`
  | `COLLECTION:${Slug}`
  | `PRODUCT:${Slug}`
  | `SEARCH:${Slug}`;

declare global {
  type RevalidateTag = RevalidateTag;
}

interface NextFetchRequestConfig {
  tags?: RevalidateTag[];
}
