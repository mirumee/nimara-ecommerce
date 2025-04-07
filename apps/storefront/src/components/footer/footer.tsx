import { getTranslations } from "next-intl/server";

import BrandLogo from "@/assets/brand-logo-dark.svg";
import { CACHE_TTL } from "@/config";
import { Link } from "@/i18n/routing";
import { paths } from "@/lib/paths";
import { getCurrentRegion } from "@/regions/server";
import { cmsMenuService } from "@/services/cms";

export const Footer = async () => {
  const [region, t] = await Promise.all([
    getCurrentRegion(),
    getTranslations(),
  ]);

  const pages = await cmsMenuService.menuGet({
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

  const categories = await cmsMenuService.menuGet({
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

  return (
    <footer className="bg-muted text-sm text-primary">
      <div className="container">
        <div className="flex flex-wrap justify-between gap-8 py-8">
          <div className="grid w-full grid-cols-2 grid-rows-[max-content,max-content] place-items-start justify-start gap-6 md:grid-cols-3">
            <div className="col-span-2 row-span-2 grid grid-cols-subgrid grid-rows-subgrid md:col-span-1">
              <Link
                className="col-span-2 flex justify-center md:col-span-1 md:justify-start"
                href={paths.home.asPath()}
                title={t("common.go-to-homepage")}
              >
                <BrandLogo height={36} className="fill-primary" />
              </Link>
              <p className="col-span-2 flex justify-center md:col-span-1 md:justify-start">
                {t.rich("footer.demo-version", {
                  link: (chunks) => (
                    <Link
                      href="https://github.com/mirumee/nimara-ecommerce"
                      className="hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {chunks}
                    </Link>
                  ),
                })}
              </p>
            </div>

            <div className="row-span-2 grid grid-cols-subgrid grid-rows-subgrid md:col-span-1">
              <span className="flex items-center text-primary">
                {t("footer.our-products")}
              </span>
              <div className="flex flex-col gap-4">
                {categories?.menu.items.map((item) => (
                  <Link
                    key={item.id}
                    href={item.url}
                    className="hover:underline"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="row-span-2 grid grid-cols-subgrid grid-rows-subgrid md:col-span-1">
              <span className="flex items-center text-primary">
                {t("footer.help")}
              </span>
              <div className="flex flex-col gap-4">
                {pages?.menu.items.map((item) => (
                  <Link
                    key={item.id}
                    href={item.url}
                    className="hover:underline"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="flex flex-wrap justify-between gap-4 border-t border-muted-foreground/50 py-8 text-muted-foreground">
          <span className="flex-grow basis-full text-center sm:basis-1 sm:text-left">
            &#xa9; Mirumee {new Date().getFullYear()}
          </span>
          <span className="flex-grow basis-full text-center sm:basis-1">
            {t.rich("footer.made-with", {
              link: (chunks) => (
                <Link
                  href="https://mirumee.com"
                  className="hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {chunks}
                </Link>
              ),
            })}
          </span>
          <span className="flex-grow basis-full text-center sm:basis-1 sm:text-right">
            {t.rich("footer.open-source", {
              link: (chunks) => (
                <Link
                  href="https://github.com/mirumee/nimara-ecommerce"
                  className="hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {chunks}
                </Link>
              ),
            })}
          </span>
        </div>
      </div>
    </footer>
  );
};
