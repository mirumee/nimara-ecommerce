"use client";

import { useState } from "react";

import type { Menu } from "@nimara/domain/objects/Menu";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@nimara/ui/components/navigation-menu";
import { RichText } from "@nimara/ui/components/rich-text";

import { Link } from "@/i18n/routing";
import { isValidJson } from "@/lib/helpers";
import type { Maybe } from "@/lib/types";

export const Navigation = ({ menu }: { menu: Maybe<Menu> }) => {
  // Close menu manually
  const [currentMenuItem, setCurrentMenuItem] = useState("");

  if (!menu || menu?.items?.length === 0) {
    return null;
  }

  return (
    <NavigationMenu
      onValueChange={setCurrentMenuItem}
      value={currentMenuItem}
      className="mx-auto hidden max-w-screen-xl pb-2 pt-2 md:flex"
    >
      <NavigationMenuList className="gap-6">
        {menu.items.map((item) => (
          <NavigationMenuItem key={item.id}>
            <Link
              href={item.url}
              className="text-inherit no-underline hover:underline"
            >
              <NavigationMenuTrigger showIcon={!!item.children?.length}>
                {item.label}
              </NavigationMenuTrigger>
            </Link>
            {!!item.children?.length && (
              <NavigationMenuContent>
                <div className="grid w-full grid-cols-6 p-6">
                  <div className="col-span-2 flex flex-col gap-3 pr-6">
                    {!!item.children?.length &&
                      item.children
                        ?.filter((child) => !child.collectionImageUrl)
                        .map((child) => (
                          <Link
                            key={child.id}
                            href={child.url}
                            className="group block space-y-1 rounded-md p-3 hover:bg-accent"
                          >
                            <div className="text-sm font-medium leading-none">
                              {child.label}
                            </div>
                            <div className="text-sm leading-snug text-muted-foreground">
                              {child.description &&
                              isValidJson(child.description) ? (
                                <RichText
                                  className="py-1"
                                  jsonStringData={child.description}
                                />
                              ) : (
                                <p className="py-1">{child.description}</p>
                              )}
                            </div>
                          </Link>
                        ))}
                  </div>

                  <div className="col-span-4 grid grid-cols-3 gap-3">
                    {!!item.children?.length &&
                      item.children
                        ?.filter((child) => child.collectionImageUrl)
                        .slice(0, 3)
                        .map((child) => (
                          <Link
                            key={child.id}
                            href={child.url}
                            className="group relative min-h-[270px] overflow-hidden rounded-lg bg-accent"
                            onClick={() => setCurrentMenuItem("")}
                          >
                            <div
                              className="h-1/2 bg-cover bg-center"
                              style={{
                                backgroundImage: `url(${child?.collectionImageUrl})`,
                              }}
                            />
                            <div className="flex h-1/2 flex-col justify-start bg-muted/50 p-6">
                              <div className="relative z-20 space-y-2">
                                <div className="text-lg font-medium leading-none group-hover:underline">
                                  {child.label}
                                </div>
                                <div className="text-sm leading-snug text-muted-foreground">
                                  {child.description &&
                                  isValidJson(child.description) ? (
                                    <RichText
                                      className="py-1"
                                      jsonStringData={child.description}
                                    />
                                  ) : (
                                    <p className="py-1">{child.description}</p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </Link>
                        ))}
                  </div>
                </div>
              </NavigationMenuContent>
            )}
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  );
};
