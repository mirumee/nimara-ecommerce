import type { Attribute } from "@nimara/domain/objects/Attribute";
import type { MenuItem } from "@nimara/domain/objects/Menu";
import { loggingService } from "@nimara/infrastructure/logging/service";

export const getAttributes = (
  attributes: Attribute[] | undefined,
  slugs: string[],
) => {
  if (!attributes) {
    return {};
  }

  return attributes.reduce(
    (acc, attr) => {
      if (attr?.slug && slugs.includes(attr.slug)) {
        acc[attr.slug] = attr;
      }

      return acc;
    },
    {} as { [key: string]: Attribute },
  );
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
