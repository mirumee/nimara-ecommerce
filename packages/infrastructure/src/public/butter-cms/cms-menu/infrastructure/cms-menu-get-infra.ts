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
      menu = await Butter(token).content.retrieve(["navigation_menu"], {
        locale: "enus",
      });
    }

    if (!menu?.data?.data?.navigation_menu) {
      return null;
    }

    let submenu;

    try {
      submenu = await Butter(token).content.retrieve(
        ["navigation_menu_item_second_level"],
        locale ? { locale } : undefined,
      );
    } catch (error) {
      submenu = await Butter(token).content.retrieve(
        ["navigation_menu_item_second_level"],
        { locale: "enus" },
      );
    }

    if (!submenu?.data?.data?.navigation_menu_item_second_level) {
      return null;
    }

    console.log(
      "<<<< SUBMENU",
      JSON.stringify(
        submenu?.data?.data?.navigation_menu_item_second_level,
        null,
        2,
      ),
    );

    const selectedMenu = menu.data.data.navigation_menu.find(
      (menu: ButterCMSMenuItem) =>
        menu.name.toLowerCase() === slug?.toLowerCase(),
    );

    if (!selectedMenu) {
      return null;
    }

    return {
      menu: {
        items: await serializeButterCMSMenuItem(
          selectedMenu.menu_items as ButterCMSMenuItem[],
          async () =>
            submenu?.data?.data?.navigation_menu_item_second_level || [],
        ),
      },
    };
  };
