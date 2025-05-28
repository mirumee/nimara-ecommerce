"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { useState } from "react";

import type { Menu } from "@nimara/domain/objects/Menu";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@nimara/ui/components/navigation-menu";
import { RichText } from "@nimara/ui/components/rich-text/rich-text";

import { Link } from "@/i18n/routing";
import { isValidJson } from "@/lib/helpers";
import type { Maybe } from "@/lib/types";

export const Navigation = ({ menu }: { menu: Maybe<Menu> }) => {
  // Close menu manually
  const [currentMenuItem, setCurrentMenuItem] = useState("");
  const t = useTranslations("site");

  if (!menu || menu?.items?.length === 0) {
    return null;
  }

  return (
    <NavigationMenu
      aria-label={t("main-navigation")}
      onValueChange={setCurrentMenuItem}
      value={currentMenuItem}
      className="mx-auto hidden max-w-screen-xl pb-2 pt-2 md:flex"
    >
      <NavigationMenuList className="gap-6">
        {menu.items.map((item) => {
          const childrenWithoutImage = item.children?.filter(
            (child) => !child.collectionImageUrl,
          );

          const childrenWithImage = item.children?.filter(
            (child) => child.collectionImageUrl,
          );

          return (
            <NavigationMenuItem key={item.id}>
              <Link
                href={item.url}
                className="text-inherit no-underline hover:underline"
                prefetch={false}
                legacyBehavior
                passHref
              >
                {!!item.children?.length ? (
                  <NavigationMenuTrigger
                    showIcon={!!item.children?.length}
                    onClick={() => setCurrentMenuItem("")}
                  >
                    {item.label}
                  </NavigationMenuTrigger>
                ) : (
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    {item.label}
                  </NavigationMenuLink>
                )}
              </Link>
              <NavigationMenuContent>
                <div className="grid w-full grid-cols-6 p-6">
                  <div className="col-span-2 flex flex-col gap-3 pr-6">
                    {!!item.children?.length &&
                      childrenWithoutImage?.map((child) => (
                        <Link
                          key={child.id}
                          href={child.url}
                          className="hover:bg-accent group block space-y-1 rounded-md p-3"
                          prefetch={false}
                        >
                          <div className="text-sm font-medium leading-none">
                            {child.label}
                          </div>
                          {child.description && (
                            <div className="text-muted-foreground text-sm leading-snug">
                              {isValidJson(child.description) ? (
                                <RichText
                                  className="line-clamp-3 py-1"
                                  contentData={child.description}
                                  disableProse
                                />
                              ) : (
                                <p className="py-1">{child.description}</p>
                              )}
                            </div>
                          )}
                        </Link>
                      ))}
                  </div>

                  <div className="col-span-4 grid grid-cols-3 gap-3">
                    {!!item.children?.length &&
                      childrenWithImage?.slice(0, 3).map((child) => (
                        <Link
                          key={child.id}
                          href={child.url}
                          className="bg-accent group relative min-h-[270px] overflow-hidden rounded-lg"
                          onClick={() => setCurrentMenuItem("")}
                          prefetch={false}
                        >
                          <div className="relative h-1/2">
                            {child.collectionImageUrl && (
                              <Image
                                src={child.collectionImageUrl}
                                alt={child.label}
                                layout="fill"
                                objectFit="cover"
                              />
                            )}
                          </div>
                          <div className="bg-muted/50 flex h-1/2 flex-col justify-start p-6">
                            <div className="relative z-20 space-y-2">
                              <div className="text-lg font-medium leading-none group-hover:underline">
                                {child.label}
                              </div>
                              <div className="text-muted-foreground overflow-hidden text-sm leading-snug">
                                {child.description &&
                                isValidJson(child.description) ? (
                                  <RichText
                                    disableProse
                                    className="line-clamp-3 max-h-[4.5em] overflow-hidden py-1"
                                    contentData={child.description}
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
            </NavigationMenuItem>
          );
        })}
      </NavigationMenuList>
    </NavigationMenu>
  );
};
