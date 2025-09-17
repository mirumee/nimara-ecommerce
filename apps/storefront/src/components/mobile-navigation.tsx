import type { Menu } from "@nimara/domain/objects/Menu";

import { LocalizedLink } from "@/i18n/routing";
import type { Maybe } from "@/lib/types";

export const MobileNavigation = ({
  menu,
  onMenuItemClick,
}: {
  menu: Maybe<Menu>;
  onMenuItemClick: (isMenuItemClicked: boolean) => void;
}) => {
  if (!menu || menu?.items?.length === 0) {
    return null;
  }

  return (
    <ul className="grid py-4">
      {menu.items.map((item) => (
        <li
          key={item.id}
          className="dark:text-muted-foreground p-2 text-stone-700"
        >
          <LocalizedLink href={item.url} onClick={() => onMenuItemClick(true)}>
            {item.label}
          </LocalizedLink>
          {!!item.children?.length && (
            <ul className="mt-2 pl-6">
              {item.children.map((child) => (
                <li key={child.id} className="text-primary py-1 pl-2">
                  <LocalizedLink
                    href={child.url}
                    onClick={() => onMenuItemClick(true)}
                  >
                    {child.label}
                  </LocalizedLink>
                </li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ul>
  );
};
