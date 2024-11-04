import Butter from "buttercms/lib/butter";

import type { ButterCMSPageFields } from "@nimara/domain/objects/CMSPage";

import {
  convertLanguageCode,
  parseDataToCMSFields,
} from "#root/lib/serializers/cmsData";
import type { CMSPageGetInfra } from "#root/use-cases/cms-page/types";

import type { ButterCMSPageServiceConfig } from "../types";

export const butterCMSPageGetInfra =
  ({ token }: ButterCMSPageServiceConfig): CMSPageGetInfra =>
  async ({ pageType = "homepage", slug, languageCode }) => {
    const page = await Butter(token).page.retrieve(pageType, slug, {
      locale: convertLanguageCode(languageCode),
    });

    if (!page?.data?.data) {
      return null;
    }

    const fields = page.data.data.fields as ButterCMSPageFields;

    return {
      title: page.data.data.name,
      fields: parseDataToCMSFields(fields, "butterCms"),
    };
  };
