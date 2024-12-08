import type { Menu } from "@nimara/domain/objects/Menu";

import { Link } from "@/i18n/routing";
import type { Maybe } from "@/lib/types";

export const MobileNavigation = ({
  menu,
  onMenuItemClick,
}: {
  menu: Maybe<Menu>;
  onMenuItemClick: (isMenuItemClicked: boolean) => void;
}) => {
  const handleMenuItemClick = () => {
    onMenuItemClick(true);
  };

  if (!menu || menu?.items?.length === 0) {
    return null;
  }

  return (
    <ul className="grid py-4">
      {menu.items.map((item) => (
        <li key={item.id} className="p-2 text-stone-500">
          <Link href={item.url} onClick={() => handleMenuItemClick()}>
            {item.label}
          </Link>
          {item.children?.length ? (
            <ul className="mt-2 pl-6">
              {item.children.map((child) => (
                <li key={child.id} className="py-1 pl-2 text-stone-700">
                  <Link href={child.url} onClick={() => handleMenuItemClick()}>
                    {child.label}
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
        </li>
      ))}
    </ul>
  );
};
