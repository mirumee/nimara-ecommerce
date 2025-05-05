import Butter from "buttercms/lib/butter";
import { invariant } from "ts-invariant";

import type { ButterCMSMenuItem } from "@nimara/domain/objects/Menu";
import { ok } from "@nimara/domain/objects/Result";

import { serializeButterCMSMenuItem } from "#root/lib/serializers/cms-menu";
import { convertLanguageCode } from "#root/lib/serializers/cms-page";
import type { CMSMenuGetInfra } from "#root/use-cases/cms-menu/types";

import type { ButterCMSMenuServiceConfig } from "../../types";

export const butterCMSMenuGetInfra =
  ({ token, logger }: ButterCMSMenuServiceConfig): CMSMenuGetInfra =>
  async ({ languageCode, slug }) => {
    invariant(
      token,
      "ButterCMS token is required but was not provided. Set NEXT_PUBLIC_BUTTER_CMS_API_KEY in the environment variables.",
    );
    const locale = convertLanguageCode(languageCode);
    let menu;

    try {
      // @ts-expect-error due to deep type inference issues with ButterCMS types
      menu = await Butter(token).content.retrieve(
        ["navigation_menu"],
        locale ? { locale } : undefined,
      );
    } catch (error) {
      logger.error("Unexpected error while fetching CMS data from ButterCMS", {
        errors: error,
        locale,
        slug,
      });

      menu = await Butter(token).content.retrieve(["navigation_menu"], {
        locale: "enus",
      });
    }

    if (!menu?.data?.data?.navigation_menu) {
      logger.warning("No data returned from ButterCMS", {
        locale,
        slug,
      });

      return ok(null);
    }

    let submenu;

    try {
      submenu = await Butter(token).content.retrieve(
        ["navigation_menu_item_second_level"],
        locale ? { locale } : undefined,
      );
    } catch (error) {
      logger.error("Unexpected error while fetching CMS data from ButterCMS", {
        errors: error,
        locale,
        slug,
      });

      submenu = await Butter(token).content.retrieve(
        ["navigation_menu_item_second_level"],
        { locale: "enus" },
      );
    }

    if (!submenu?.data?.data?.navigation_menu_item_second_level) {
      logger.warning("No data returned from ButterCMS", {
        locale,
        slug,
      });

      return ok(null);
    }

    const selectedMenu = menu.data.data.navigation_menu.find(
      (menu: ButterCMSMenuItem) =>
        menu.name.toLowerCase() === slug?.toLowerCase(),
    );

    if (!selectedMenu) {
      logger.warning("No menu data returned from ButterCMS", {
        locale,
        slug,
      });

      return ok(null);
    }

    return ok({
      menu: {
        items: await serializeButterCMSMenuItem(
          selectedMenu.menu_items as ButterCMSMenuItem[],
          async () =>
            submenu?.data?.data?.navigation_menu_item_second_level || [],
        ),
      },
    });
  };
