import type { MenuItem } from "@nimara/domain/objects/Menu";
import { loggingService } from "@nimara/infrastructure/logging/service";

export const getQueryParams = (
  item: MenuItem,
): { queryKey: string | null; queryValue: string | null } => {
  if (item.url) {
    const url = new URL(item.url);
    const queryKey = Array.from(url.searchParams.keys())[0] || null;
    const queryValue = queryKey ? url.searchParams.get(queryKey) : null;

    if (queryKey && queryValue) {
      return { queryKey, queryValue };
    }
  }

  if (item.category?.slug) {
    return { queryKey: "category", queryValue: item.category.slug };
  }

  if (item.collection?.slug) {
    return { queryKey: "collection", queryValue: item.collection.slug };
  }

  return { queryKey: null, queryValue: null };
};

export const getCombinedQueryParams = (
  parentItem: MenuItem,
  childItem: MenuItem,
): { [key: string]: string } => {
  const parentParams = getQueryParams(parentItem);
  const childParams = getQueryParams(childItem);

  return {
    ...(parentParams.queryKey && parentParams.queryValue
      ? { [parentParams.queryKey]: parentParams.queryValue }
      : {}),
    ...(childParams.queryKey && childParams.queryValue
      ? { [childParams.queryKey]: childParams.queryValue }
      : {}),
  };
};

interface Paths {
  page: {
    asPath: (params: { slug: string }) => string;
  };
  search: {
    asPath: (params: { query: Record<string, string> }) => string;
  };
}
//TO DO - handle validating internal url
export const generateLinkUrl = (item: MenuItem, paths: Paths): string => {
  if (item.collection) {
    return paths.search.asPath({
      query: { collection: item.collection.slug },
    });
  }
  if (item.category) {
    return paths.search.asPath({
      query: { category: item.category.slug },
    });
  }
  if (item.page) {
    return paths.page.asPath({ slug: item.page.slug });
  }
  if (item.url) {
    return item.url;
  }

  return "#";
};

const internalUrls = [
  "https://nimara-dev.vercel.app",
  "https://nimara-stage.vercel.app",
  "https://nimara-prod.vercel.app",
  "http://localhost",
  "https://localhost",
];

export const isInternalUrl = (url: string | null): boolean => {
  if (url === null) {
    return true;
  }
  if (url) {
    try {
      const parsedUrl = new URL(url);

      return internalUrls.some((internalUrl) => {
        const internalParsedUrl = new URL(internalUrl);

        return parsedUrl.hostname === internalParsedUrl.hostname;
      });
    } catch (e) {
      loggingService.error("Given URL is not internal", {
        error: e,
      });

      return false;
    }
  }

  return false;
};
