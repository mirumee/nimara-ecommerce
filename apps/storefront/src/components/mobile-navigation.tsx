import type { Menu, MenuItem } from "@nimara/domain/objects/Menu";

import { Link, useRouter } from "@/i18n/routing";
import {
  generateLinkUrl,
  getCombinedQueryParams,
  getQueryParams,
  isInternalUrl,
} from "@/lib/cms";
import { paths } from "@/lib/paths";
import type { Maybe } from "@/lib/types";

export const MobileNavigation = ({
  menu,
  onMenuItemClick,
}: {
  menu: Maybe<Menu>;
  onMenuItemClick: (isMenuItemClicked: boolean) => void;
}) => {
  const router = useRouter();

  const handleMenuItemClick = () => {
    onMenuItemClick(true);
  };

  const handleLinkClick = (
    e: React.MouseEvent,
    item: MenuItem,
    parentItem?: MenuItem,
  ) => {
    handleMenuItemClick();
    const combinedParams = parentItem
      ? getCombinedQueryParams(parentItem, item)
      : getQueryParams(item);

    // Filter out any null values to ensure compatibility with router.push
    const queryParams = Object.fromEntries(
      Object.entries(combinedParams).filter(([_, value]) => value !== null),
    ) as Record<string, string>;

    if (Object.keys(queryParams).length > 0 && item.category) {
      e.preventDefault();
      router.push(
        paths.search.asPath({
          query: queryParams,
        }),
      );
    }
  };

  if (!menu || menu?.items?.length === 0) {
    return null;
  }

  return (
    <ul className="grid py-4">
      {menu.items.map((item) => (
        <li key={item.id} className="p-2 text-stone-500">
          {isInternalUrl(item.url) ? (
            <Link
              href={generateLinkUrl(item, paths)}
              onClick={(e) => handleLinkClick(e, item)}
            >
              {item.name || item.category?.name || item.collection?.name}
            </Link>
          ) : (
            <a
              href={item.url as string}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => handleLinkClick(e, item)}
            >
              {item.name}
            </a>
          )}
          {item.children?.length ? (
            <ul className="mt-2 pl-6">
              {item.children.map((child) => (
                <li key={child.id} className="py-1 pl-2 text-stone-700">
                  {isInternalUrl(child.url) ? (
                    <Link
                      href={generateLinkUrl(child, paths)}
                      onClick={(e) => handleLinkClick(e, child, item)}
                    >
                      {child.name ||
                        child.collection?.name ||
                        child.category?.name}
                    </Link>
                  ) : (
                    <a
                      href={child.url as string}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => handleLinkClick(e, child, item)}
                    >
                      {child.name}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          ) : null}
        </li>
      ))}
    </ul>
  );
};
