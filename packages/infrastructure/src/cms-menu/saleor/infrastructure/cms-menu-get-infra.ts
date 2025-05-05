import { ok } from "@nimara/domain/objects/Result";

import { graphqlClient } from "#root/graphql/client";
import { serializeSaleorMenu } from "#root/lib/serializers/cms-menu";
import type { CMSMenuGetInfra } from "#root/use-cases/cms-menu/types";

import type { SaleorCMSMenuServiceConfig } from "../../types";
import { MenuGetDocument } from "../graphql/queries/generated";

export const saleorCMSMenuGetInfra =
  ({ apiURL, logger }: SaleorCMSMenuServiceConfig): CMSMenuGetInfra =>
  async ({ channel, languageCode, slug, id, options, locale }) => {
    const result = await graphqlClient(apiURL).execute(MenuGetDocument, {
      options,
      variables: {
        channel,
        languageCode,
        slug,
        id,
      },
      operationName: "MenuGetQuery",
    });

    if (!result.ok) {
      logger.error("Unexpected error while fetching CMS data from Saleor", {
        errors: result.errors,
        channel,
        languageCode,
        slug,
        id,
      });

      return result;
    }

    if (!result.data) {
      logger.warning("No data returned from Saleor CMS", {
        channel,
        languageCode,
        slug,
        id,
      });

      return ok(null);
    }

    if (!result.data.menu || !result.data.menu.items) {
      logger.warning("No menu data returned from Saleor CMS", {
        channel,
        languageCode,
        slug,
        id,
      });

      return ok(null);
    }

    return ok({
      menu: serializeSaleorMenu(result.data.menu.items ?? [], locale),
    });
  };
