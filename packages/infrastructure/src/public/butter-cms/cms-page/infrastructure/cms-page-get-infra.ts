import type PageRetrieveParams from "buttercms";
import Butter from "buttercms/lib/butter";

import {
  type ButterCMSPageFields,
  PageType,
} from "@nimara/domain/objects/CMSPage";

import {
  convertLanguageCode,
  parseDataToCMSFields,
} from "#root/lib/serializers/cms-page";
import type { CMSPageGetInfra } from "#root/use-cases/cms-page/types";

import type { ButterCMSPageServiceConfig } from "../types";

// Copied from buttercms types to enable `locale` typing until they export it directly.
// TODO: remove when locale will be added in next buttercms version
interface PageRetrieveParams {
  levels?: number;
  locale?: string;
  preview?: 0 | 1;
}

export const butterCMSPageGetInfra =
  ({ token }: ButterCMSPageServiceConfig): CMSPageGetInfra =>
  async ({ pageType, slug, languageCode }) => {
    const resolvedPageType = pageType ?? PageType.STATIC_PAGE;
    const locale = convertLanguageCode(languageCode);
    const page = await Butter(token).page.retrieve(resolvedPageType, slug, {
      locale,
    } as PageRetrieveParams);

    if (!page?.data?.data) {
      return null;
    }

    const fields = page.data.data.fields as ButterCMSPageFields;

    const content =
      typeof fields["content"] === "string" ? fields["content"] : null;

    return {
      title: page.data.data.name,
      content: content,
      fields: parseDataToCMSFields(fields, "butterCms"),
    };
  };
