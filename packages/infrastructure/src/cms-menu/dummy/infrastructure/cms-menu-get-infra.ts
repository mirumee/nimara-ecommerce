import { ok } from "@nimara/domain/objects/Result";

import { type CMSMenuGetInfra } from "#root/use-cases/cms-menu/types";

import { SAMPLE_MENUS } from "../fixtures/sample-menus";
import type { DummyCMSMenuServiceConfig } from "../types";

export const dummyCMSMenuGetInfra =
  (_config: DummyCMSMenuServiceConfig): CMSMenuGetInfra =>
  async ({ slug }) => {
    if (slug && SAMPLE_MENUS[slug]) {
      return ok({ menu: SAMPLE_MENUS[slug] });
    }

    return ok(null);
  };
