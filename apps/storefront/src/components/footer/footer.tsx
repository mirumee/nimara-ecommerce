import Link from "next/link";
import { getTranslations } from "next-intl/server";

import { ReactComponent as NimaraLogo } from "@/assets/nimara-logo.svg";
import { CACHE_TTL } from "@/config";
import { generateLinkUrl } from "@/lib/helpers";
import { paths } from "@/lib/paths";
import { getCurrentRegion } from "@/regions/server";
import { cmsMenuService } from "@/services";

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
    <footer className="bg-gray-100 text-sm">
      <div className="container">
        <div className="grid">
          <div className="flex flex-wrap justify-between gap-8 py-8">
            <div className="grid flex-grow basis-full content-start gap-4 md:basis-1">
              <Link
                className="flex justify-start align-middle"
                href={paths.home.asPath()}
                title={t("common.go-to-homepage")}
              >
                <NimaraLogo height={36} />
              </Link>
              <p className="text-neutral-600">
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

            <div className="grid flex-grow basis-1 gap-8">
              <span className="text-neutral-600">
                {t("footer.our-products")}
              </span>
              <ul className="grid gap-4">
                {categories?.menu.items.map((item) => (
                  <li key={item.name}>
                    <Link href={generateLinkUrl(item, paths)}>{item.name}</Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid flex-grow basis-1 gap-8">
              <span className="text-neutral-600"> {t("footer.help")}</span>
              <ul className="grid gap-4">
                {pages?.menu.items.map((item) => (
                  <li key={item.page?.title}>
                    <Link href={generateLinkUrl(item, paths)}>
                      {item?.name || item.page?.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex flex-wrap justify-between gap-4 border-t border-t-gray-300 py-8 text-neutral-600">
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
      </div>
    </footer>
  );
};
