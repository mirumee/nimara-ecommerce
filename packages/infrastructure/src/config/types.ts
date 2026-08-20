import { type AsyncResult } from "@nimara/domain/objects/Result";

export type ConfigItemRepository<TValue> = {
  get: () => AsyncResult<TValue | null>;
  upsert: (opts: { value: TValue }) => AsyncResult<TValue>;
};
