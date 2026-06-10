import { ok } from "@nimara/domain/objects/Result";

import type { GetSortByOptionsInfra } from "#root/use-cases/search/types";

import { SAMPLE_SORT_OPTIONS } from "../fixtures/sample-data";
import type { DummySearchServiceConfig } from "../types";

export const dummyGetSortByOptionsInfra =
  (_config: DummySearchServiceConfig): GetSortByOptionsInfra =>
  () =>
    ok(SAMPLE_SORT_OPTIONS);
