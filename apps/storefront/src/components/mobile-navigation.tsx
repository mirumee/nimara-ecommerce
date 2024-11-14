import type { Menu } from "@nimara/domain/objects/Menu";

import { Link } from "@/i18n/routing";
import { generateLinkUrl, isInternalUrl } from "@/lib/cms";
import { paths } from "@/lib/paths";
import type { Maybe } from "@/lib/types";

export const MobileNavigation = ({
  menu,
  onMenuItemClick,
}: {
  menu: Maybe<Menu>;
  onMenuItemClick: (isMenuItemClicked: boolean) => void;
}) => {
  const handleClick = () => {
    onMenuItemClick(true);
  };

  if (!menu || menu?.items?.length === 0) {
    return null;
  }

  return (
    <ul className="grid py-4">
      {menu.items.map((item) => (
        <li key={item.id} className="p-2 text-stone-500">
          {isInternalUrl(item.url) ? (
            <Link href={generateLinkUrl(item, paths)} onClick={handleClick}>
              {item.name || item.category?.name || item.collection?.name}
            </Link>
          ) : (
            <a
              href={item.url as string}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleClick}
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
                      onClick={handleClick}
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
                      onClick={handleClick}
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
