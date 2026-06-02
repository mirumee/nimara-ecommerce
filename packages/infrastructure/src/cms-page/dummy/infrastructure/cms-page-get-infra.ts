import { ok } from "@nimara/domain/objects/Result";

import { type CMSPageGetInfra } from "#root/use-cases/cms-page/types";

import { SAMPLE_PAGES } from "../fixtures/sample-pages";
import type { DummyCMSPageServiceConfig } from "../types";

export const dummyCMSPageGetInfra =
  (_config: DummyCMSPageServiceConfig): CMSPageGetInfra =>
  async ({ slug }) =>
    ok(SAMPLE_PAGES[slug] ?? null);
