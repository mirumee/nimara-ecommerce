import type { Menu } from "@nimara/domain/objects/Menu";

import { Link } from "@/i18n/routing";
import { generateLinkUrl, isInternalUrl } from "@/lib/helpers";
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
        <li key={item.id} className="p-2 text-stone-500" onClick={handleClick}>
          {isInternalUrl(item.url) ? (
            <Link href={generateLinkUrl(item, paths)}>
              {item.name || item.category?.name || item.collection?.name}
              {item.children?.length ? (
                <ul>
                  {item.children.map((child) => (
                    <li
                      key={child.id}
                      className="py-2 text-stone-900"
                      onClick={handleClick}
                    >
                      <Link href={generateLinkUrl(child, paths)}>
                        {child.name ||
                          child.collection?.name ||
                          child.category?.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : null}
            </Link>
          ) : (
            <a href={item.url as string} target="_blank">
              {item.name}
            </a>
          )}
        </li>
      ))}
    </ul>
  );
};
