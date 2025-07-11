import type { SearchProduct } from "@nimara/domain/objects/SearchProduct";

export type SearchProductSerializer<
  T extends Record<string, any> = Record<string, any>,
> = {
  (data: T): Readonly<SearchProduct>;
};
