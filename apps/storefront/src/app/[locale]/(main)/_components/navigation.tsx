"use client";

import type { Menu } from "@nimara/domain/objects/Menu";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@nimara/ui/components/navigation-menu";
import { RichText } from "@nimara/ui/components/rich-text";

import { Link, useRouter } from "@/i18n/routing";
import { generateLinkUrl, getQueryParams } from "@/lib/cms";
import { paths } from "@/lib/paths";
import type { Maybe } from "@/lib/types";

export const Navigation = ({ menu }: { menu: Maybe<Menu> }) => {
  const router = useRouter();

  if (!menu || menu?.items?.length === 0) {
    return null;
  }

  return (
    <NavigationMenu className="mx-auto hidden max-w-screen-xl pb-6 pt-3 md:flex">
      <NavigationMenuList className="gap-6">
        {menu.items.map((item) => (
          <NavigationMenuItem key={item.id}>
            <NavigationMenuTrigger
              showIcon={!!item.children?.length}
              onClick={() => {
                const { queryKey, queryValue } = getQueryParams(item);

                if (queryKey && queryValue) {
                  router.replace(
                    paths.search.asPath({
                      query: {
                        [queryKey]: queryValue,
                      },
                    }),
                  );
                }
              }}
            >
              {item.name}
            </NavigationMenuTrigger>
            {item.children?.length ? (
              <NavigationMenuContent>
                <div className="grid w-full grid-cols-6 p-6">
                  <div className="col-span-2 flex flex-col gap-3 pr-6">
                    {item.children?.length
                      ? item.children
                          ?.filter((child) => !child.collection)
                          .map((child) => (
                            <Link
                              key={child.id}
                              href={generateLinkUrl(child, paths)}
                              className="group block space-y-1 rounded-md p-3 hover:bg-accent"
                            >
                              <div className="text-sm font-medium leading-none">
                                {child.name || child.category?.name}
                              </div>
                              <div className="text-sm leading-snug text-muted-foreground">
                                <RichText
                                  className="py-1"
                                  jsonStringData={child.category?.description}
                                />
                              </div>
                            </Link>
                          ))
                      : null}
                  </div>

                  <div className="col-span-4 grid grid-cols-3 gap-3">
                    {item.children?.length
                      ? item.children
                          ?.filter((child) => child.collection)
                          .slice(0, 3)
                          .map((child) => (
                            <Link
                              key={child.id}
                              href={generateLinkUrl(child, paths)}
                              className="group relative min-h-[270px] overflow-hidden rounded-lg bg-accent"
                            >
                              <div
                                className="h-1/2 bg-cover bg-center"
                                style={{
                                  backgroundImage: `url(${child.collection?.backgroundImage?.url})`,
                                }}
                              />
                              <div className="flex h-1/2 flex-col justify-start bg-muted/50 p-6">
                                <div className="relative z-20 space-y-2">
                                  <div className="text-lg font-medium leading-none group-hover:underline">
                                    {child.name || child.collection?.name}
                                  </div>
                                  <div className="text-sm leading-snug text-muted-foreground">
                                    <RichText
                                      className="py-1"
                                      jsonStringData={
                                        child.collection?.description
                                      }
                                    />
                                  </div>
                                </div>
                              </div>
                            </Link>
                          ))
                      : null}
                  </div>
                </div>
              </NavigationMenuContent>
            ) : null}
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  );
};
