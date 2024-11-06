import Butter from "buttercms/lib/butter";

import type { ButterCMSMenuItem } from "@nimara/domain/objects/Menu";

import { serializeMenu } from "#root/lib/serializers/cms-menu";
import { convertLanguageCode } from "#root/lib/serializers/cms-page";
import type { CMSMenuGetInfra } from "#root/use-cases/cms-menu/types";

import type { ButterCMSMenuServiceConfig } from "../types";

export const butterCMSMenuGetInfra =
  ({ token }: ButterCMSMenuServiceConfig): CMSMenuGetInfra =>
  async ({ languageCode, slug }) => {
    const locale = languageCode ? convertLanguageCode(languageCode) : undefined;

    // Using `as any` to bypass TypeScript's deep type inference issues with ButterCMS types.
    const menu = await (Butter(token).content as any).retrieve(
      ["navigation_menu"],
      locale ? { locale } : undefined,
    );

    if (!menu?.data?.data?.navigation_menu) {
      return null;
    }

    const selectedMenu = menu.data.data.navigation_menu.find(
      (menu: ButterCMSMenuItem) =>
        menu.name.toLowerCase() === slug?.toLowerCase(),
    );

    return {
      menu: serializeMenu(
        selectedMenu.menu_items as ButterCMSMenuItem[],
        "butterCms",
      ),
    };
  };
