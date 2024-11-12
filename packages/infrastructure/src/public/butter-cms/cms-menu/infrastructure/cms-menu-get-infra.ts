import Butter from "buttercms/lib/butter";

import type { ButterCMSMenuItem } from "@nimara/domain/objects/Menu";

import { serializeButterCMSMenuItem } from "#root/lib/serializers/cms-menu";
import { convertLanguageCode } from "#root/lib/serializers/cms-page";
import type { CMSMenuGetInfra } from "#root/use-cases/cms-menu/types";

import type { ButterCMSMenuServiceConfig } from "../types";

export const butterCMSMenuGetInfra =
  ({ token }: ButterCMSMenuServiceConfig): CMSMenuGetInfra =>
  async ({ languageCode, slug }) => {
    const locale = convertLanguageCode(languageCode);
    let menu;

    try {
      // @ts-expect-error due to deep type inference issues with ButterCMS types
      menu = await Butter(token).content.retrieve(
        ["navigation_menu"],
        locale ? { locale } : undefined,
      );
    } catch (error) {
      // Fallback to 'EN_US' if the initial request fails
      menu = await Butter(token).content.retrieve(["navigation_menu"], {
        locale: "enus",
      });
    }

    if (!menu?.data?.data?.navigation_menu) {
      return null;
    }

    const selectedMenu = menu.data.data.navigation_menu.find(
      (menu: ButterCMSMenuItem) =>
        menu.name.toLowerCase() === slug?.toLowerCase(),
    );

    return {
      menu: {
        items: serializeButterCMSMenuItem(
          selectedMenu.menu_items as ButterCMSMenuItem[],
        ),
      },
    };
  };
