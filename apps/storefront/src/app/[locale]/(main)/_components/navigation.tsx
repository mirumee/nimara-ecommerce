"use client";

import { type Menu } from "@nimara/domain/objects/Menu";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@nimara/ui/components/navigation-menu";

import { Link } from "@/i18n/routing";
import { generateLinkUrl } from "@/lib/helpers";
import { paths } from "@/lib/paths";
import type { Maybe } from "@/lib/types";

export const Navigation = ({ menu }: { menu: Maybe<Menu> }) => {
  if (!menu || menu?.items?.length === 0) {
    return null;
  }

  return (
    <NavigationMenu className="mx-auto hidden pb-6 pt-3 md:flex">
      <NavigationMenuList>
        {menu.items.map((item) => (
          <NavigationMenuItem key={item.id}>
            <NavigationMenuTrigger showIcon={!!item.children?.length}>
              {item?.url && <Link href={item.url}>{item.name}</Link>}
            </NavigationMenuTrigger>
            {item.children?.length ? (
              <NavigationMenuContent>
                <div className="grid w-[400px] p-2">
                  {item.children?.map((child) => (
                    <NavigationMenuLink asChild key={child.id} className="p-2">
                      <Link href={generateLinkUrl(child, paths)}>
                        <div className="text-sm font-medium leading-none group-hover:underline">
                          {child.name ||
                            child.collection?.name ||
                            child.category?.name}
                        </div>
                      </Link>
                    </NavigationMenuLink>
                  ))}
                </div>
              </NavigationMenuContent>
            ) : null}
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  );
};
