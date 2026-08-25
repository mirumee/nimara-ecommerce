import { invariant } from "graphql/jsutils/invariant";

import { type Logger } from "#root/logging/types";
import { CATEGORY_FILTER_KEY } from "#root/use-cases/search/consts";
import { type TaxonomyScope } from "#root/use-cases/search/types";

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

const VALUE_SEPARATOR = /[,.]/;

const quote = (value: string) => `'${value.replaceAll("'", "\\'")}'`;

const anyOf = (clauses: string[]) =>
  clauses.length > 1 ? `(${clauses.join(" OR ")})` : clauses[0];

export const buildFilters = ({
  filters,
  categoryScope,
  channel,
  indices,
  logger,
}: {
  categoryScope?: TaxonomyScope;
  channel: string;
  filters?: Record<string, string>;
  indices: IndicesSettings;
  logger: Logger;
}): string => {
  const mainIndex = indices.find((index) => index.channel === channel);
  const attributeBySlug = Object.entries(
    mainIndex?.availableFacets ?? {},
  ).reduce<Record<string, string>>((acc, [attribute, facet]) => {
    acc[facet.slug] = attribute;

    return acc;
  }, {});

  const clauses = Object.entries(filters ?? {}).reduce<string[]>(
    (acc, [slug, value]) => {
      const attribute = attributeBySlug[slug];

      if (!attribute || (categoryScope && slug === CATEGORY_FILTER_KEY)) {
        return acc;
      }

      const values = value.split(VALUE_SEPARATOR).filter(Boolean);

      if (!values.length) {
        return acc;
      }

      acc.push(
        anyOf(values.map((value) => `${quote(attribute)}:${quote(value)}`)),
      );

      return acc;
    },
    [],
  );

  if (categoryScope) {
    const attribute = attributeBySlug[CATEGORY_FILTER_KEY];

    if (attribute) {
      clauses.push(`${quote(attribute)}:${quote(categoryScope.name)}`);
    } else {
      logger.error(
        "Missing category facet in the Algolia index configuration, so the browsed category cannot scope the results.",
        { channel, categorySlug: categoryScope.slug },
      );
    }
  }

  return clauses.join(" AND ");
};
