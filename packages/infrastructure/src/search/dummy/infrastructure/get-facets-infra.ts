import { ok } from "@nimara/domain/objects/Result";

import type { GetFacetsInfra } from "#root/use-cases/search/types";

import { SAMPLE_FACETS } from "../fixtures/sample-data";
import type { DummySearchServiceConfig } from "../types";

export const dummyGetFacetsInfra =
  (_config: DummySearchServiceConfig): GetFacetsInfra =>
  async () =>
    ok(SAMPLE_FACETS);
