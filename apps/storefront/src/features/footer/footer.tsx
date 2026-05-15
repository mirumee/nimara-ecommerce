import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";

import { LocalizedLink } from "@nimara/i18n/routing";
import { Button } from "@nimara/ui/components/button";

import BrandLogo from "@/assets/brand-logo-dark.svg";
import { CACHE_TTL } from "@/config";
import { clientEnvs } from "@/envs/client";
import { getCurrentRegion } from "@/foundation/regions";
import { paths } from "@/foundation/routing/paths";
import { getServiceRegistry } from "@/services/registry";

export const Footer = async () => {
  const [region, services, t] = await Promise.all([
    getCurrentRegion(),
    getServiceRegistry(),
    getTranslations(),
  ]);

  const cmsMenuService = await services.getCMSMenuService();
  const resultMenu = await cmsMenuService.menuGet({
    channel: region.market.channel,
    languageCode: region.language.code,
    slug: "footer",
    options: {
      next: {
        tags: ["CMS:footer"],
        revalidate: CACHE_TTL.cms,
      },
    },
  });

  const resultCategories = await cmsMenuService.menuGet({
    channel: region.market.channel,
    languageCode: region.language.code,
    slug: "navbar",
    options: {
      next: {
        tags: ["CMS:navbar"],
        revalidate: CACHE_TTL.cms,
      },
    },
  });

  const showMarketplaceFooter =
    clientEnvs.NEXT_PUBLIC_MARKETPLACE_ENABLED &&
    Boolean(clientEnvs.NEXT_PUBLIC_MARKETPLACE_VENDOR_URL);

  const marketplaceBaseUrl = clientEnvs.NEXT_PUBLIC_MARKETPLACE_VENDOR_URL;
  const marketplaceSignInUrl = marketplaceBaseUrl
    ? new URL("/sign-in", marketplaceBaseUrl).href
    : "";
  const marketplaceSignUpUrl = marketplaceBaseUrl
    ? new URL("/sign-up", marketplaceBaseUrl).href
    : "";

  return (
    <footer className="mt-8 border-t border-border bg-background text-sm text-primary transition-[background-color]">
      <div className="container relative overflow-hidden">
        <div
          className="absolute inset-x-4 inset-y-0 flex"
          style={{ boxShadow: "1px 0 0 0 hsl(var(--border))" }}
        >
          <div
            className="hidden h-full flex-1 lg:block"
            style={{
              backgroundImage:
                "linear-gradient(0deg, hsl(var(--border)), hsl(var(--background)) 40%)",
              boxShadow: "inset 1px 0 0 0 hsl(var(--border))",
            }}
          />
          <div
            className="h-full flex-1"
            style={{
              backgroundImage:
                "linear-gradient(0deg, hsl(var(--border)), hsl(var(--background)) 70%)",
              boxShadow: "inset 1px 0 0 0 hsl(var(--border))",
            }}
          />
          <div
            className="h-full flex-1"
            style={{
              backgroundImage:
                "linear-gradient(180deg, hsl(var(--background)), hsl(var(--border)))",
              boxShadow: "inset 1px 0 0 0 hsl(var(--border))",
            }}
          />
          <div
            className="h-full flex-1"
            style={{
              backgroundImage:
                "linear-gradient(180deg, hsl(var(--background)), hsl(var(--border)))",
              boxShadow: "inset 1px 0 0 0 hsl(var(--border))",
            }}
          />
          <div
            className="h-full flex-1"
            style={{
              backgroundImage:
                "linear-gradient(0deg, hsl(var(--border)), hsl(var(--background)) 70%)",
              boxShadow: "inset 1px 0 0 0 hsl(var(--border))",
            }}
          />
          <div
            className="hidden h-full flex-1 lg:block"
            style={{
              backgroundImage:
                "linear-gradient(0deg, hsl(var(--border)), hsl(var(--background)) 40%)",
              boxShadow: "inset 1px 0 0 0 hsl(var(--border))",
            }}
          />
        </div>

        <div className="relative z-10">
          <div className="flex flex-wrap justify-between gap-8 py-8">
            <div
              className={`grid w-full grid-cols-2 grid-rows-[max-content,max-content] place-items-start justify-start ${showMarketplaceFooter ? "md:grid-cols-4" : "md:grid-cols-3"}`}
            >
              <div className="col-span-2 row-span-2 grid grid-cols-subgrid grid-rows-subgrid px-4 md:col-span-1">
                <div className="col-span-2 mb-4 flex justify-center md:col-span-1 md:justify-start">
                  <LocalizedLink
                    href={paths.home.asPath()}
                    title={t("common.go-to-homepage")}
                  >
                    <BrandLogo height={36} className="fill-primary" />
                  </LocalizedLink>
                </div>
                <div className="col-span-2 flex flex-col items-center gap-3 md:col-span-1 md:items-start">
                  <p className="text-muted-foreground">
                    {t("footer.demo-version")}
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href="https://mirumee.com/contact?utm_campaign=page&utm_medium=external%20link&utm_source=nimara_demo_store_button"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {t("footer.book-a-demo")}
                    </a>
                  </Button>
                </div>
              </div>

              <div className="row-span-2 grid grid-cols-subgrid grid-rows-subgrid px-4 md:col-span-1">
                <span className="mb-4 flex items-center text-muted-foreground">
                  {t("footer.our-products")}
                </span>
                <div className="flex flex-col gap-2">
                  {resultCategories.data?.menu.items.map((item) => (
                    <span key={item.id} className="inline">
                      <LocalizedLink
                        href={item.url}
                        className="hover:underline"
                        prefetch={false}
                      >
                        {item.label}
                      </LocalizedLink>
                    </span>
                  ))}
                </div>
              </div>

              {showMarketplaceFooter ? (
                <div className="row-span-2 grid grid-cols-subgrid grid-rows-subgrid px-4 md:col-span-1">
                  <span className="mb-4 flex items-center text-muted-foreground">
                    {t("footer.marketplace")}
                  </span>
                  <div className="flex flex-col gap-2">
                    <span className="inline">
                      <LocalizedLink
                        href={marketplaceSignInUrl}
                        className="hover:underline"
                        prefetch={false}
                      >
                        {t("footer.marketplace-sign-in")}
                      </LocalizedLink>
                    </span>
                    <span className="inline">
                      <LocalizedLink
                        href={marketplaceSignUpUrl}
                        className="hover:underline"
                        prefetch={false}
                      >
                        {t("footer.marketplace-sign-up")}
                      </LocalizedLink>
                    </span>
                  </div>
                </div>
              ) : null}

              <div className="row-span-2 grid grid-cols-subgrid grid-rows-subgrid px-4 md:col-span-1">
                <span className="mb-4 flex items-center text-muted-foreground">
                  {t("footer.help")}
                </span>
                <div className="flex flex-col gap-2">
                  {resultMenu.data?.menu?.items.map((item) => (
                    <span key={item.id} className="inline">
                      <LocalizedLink
                        href={item.url}
                        className="inline hover:underline"
                        prefetch={false}
                      >
                        {item.label}
                      </LocalizedLink>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap justify-between gap-4 border-t border-border px-4 py-8 text-muted-foreground">
            <span className="flex-grow basis-full text-center sm:basis-1 sm:text-left">
              &#xa9; Mirumee {new Date().getFullYear()}
            </span>
            <span className="flex-grow basis-full text-center sm:basis-1">
              {t("footer.made-with")}
            </span>
            <span className="flex-grow basis-full text-center sm:basis-1 sm:text-right">
              {t.rich("footer.open-source", {
                link: (chunks: ReactNode) => (
                  <LocalizedLink
                    href="https://github.com/mirumee/nimara-ecommerce"
                    className="hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                    prefetch={false}
                  >
                    {chunks}
                  </LocalizedLink>
                ),
              })}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
