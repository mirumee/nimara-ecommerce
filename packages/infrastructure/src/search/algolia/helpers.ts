import { invariant } from "graphql/jsutils/invariant";

import { type Logger } from "#root/logging/types";
import {
  CATEGORY_FILTER_KEY,
  COLLECTION_FILTER_KEY,
} from "#root/use-cases/search/consts";

import { type IndicesSettings } from "./types";

export const getIndexName = (
  indicesSettings: IndicesSettings,
  channel: string,
  logger: Logger,
  sortByParam?: string,
): string => {
  // This can be extended beyond just comparing a channel, e.g. by comparing language/currency/entity etc.
  const channelIndex = indicesSettings.find(
    (index) => index.channel === channel,
  );

  invariant(channelIndex, `Missing Algolia index for channel: ${channel}`);

  if (!sortByParam) {
    return channelIndex.indexName;
  }

  const replica = channelIndex.virtualReplicas.find(
    (replica) => replica.queryParamValue === sortByParam,
  );

  if (!replica) {
    logger.error(
      "Missing virtual replica of given index for given sortBy parameter. Returning a main index.",
      { indexName: channelIndex.indexName, sortByParam },
    );

    return channelIndex.indexName;
  }

  return replica.indexName;
};

const toCategoryName = (slug: string) => {
  const name = slug.replaceAll("-", " ");

  return name.charAt(0).toUpperCase() + name.slice(1);
};

export const buildFilters = ({
  filters,
  channel,
  indices,
}: {
  channel: string;
  filters?: Record<string, string>;
  indices: IndicesSettings;
}): string => {
  const mainIndex = indices.find((index) => index.channel === channel);
  const facetsMapping = Object.entries(mainIndex?.availableFacets ?? {}).reduce<
    Record<string, string>
  >((acc, [key, value]) => {
    acc[value.slug] = key;

    return acc;
  }, {});

  return Object.entries(filters ?? {})
    .reduce<string[]>((acc, [name, value]) => {
      if (name === COLLECTION_FILTER_KEY) {
        const formattedValue = value
          .split(".")
          .map(
            (v) =>
              `'${v.charAt(0).toUpperCase() + v.slice(1).replaceAll("-", " & ")}'`,
          )
          .join(" OR ");

        acc.push(`collections:${formattedValue}`);
      } else if (name === CATEGORY_FILTER_KEY) {
        const slugs = value.split(",");
        const formattedValue = slugs
          .map((slug) => `categories:'${toCategoryName(slug)}'`)
          .join(" OR ");

        acc.push(slugs.length > 1 ? `(${formattedValue})` : formattedValue);
      } else if (name in facetsMapping) {
        const values = value.split(".");

        if (values.length > 1) {
          const multipleValuesFacet: string[] = [];

          values.forEach((v) => {
            multipleValuesFacet.push(`'${facetsMapping[name]}':'${v}'`);
          });

          acc.push(multipleValuesFacet.join(" OR "));
        } else {
          acc.push(`'${facetsMapping[name]}':'${value}'`);
        }
      }

      return acc;
    }, [])
    .join(" AND ");
};
