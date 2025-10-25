import Image from "next/image";
import { getTranslations } from "next-intl/server";

import nimaraCubeLogo from "@/assets/ nimara-storefront-cube.png";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { CACHE_TTL } from "@/config";
import { LocalizedLink } from "@/i18n/routing";
import { getLocalePrefix } from "@/lib/server";
import { getCurrentRegion } from "@/regions/server";
import { cmsMenuService } from "@/services/cms";

import { Navigation } from "./(main)/_components/navigation";

export default async function NotFound() {
  const [region, locale, t] = await Promise.all([
    getCurrentRegion(),
    getLocalePrefix(),
    getTranslations("notFound"),
  ]);

  const resultMenu = await cmsMenuService.menuGet({
    channel: region.market.channel,
    languageCode: region.language.code,
    locale,
    slug: "navbar",
    options: {
      next: {
        tags: ["CMS:navbar"],
        revalidate: CACHE_TTL.cms,
      },
    },
  });

  return (
    <>
      <div className="bg-background sticky top-0 isolate z-50 py-4 md:pb-0">
        <Header />
        <Navigation menu={resultMenu.data?.menu} />
      </div>
      <main className="bg-background container sm:mb-16 sm:mt-20">
        <div className="xs:items-center flex w-full flex-wrap-reverse justify-between bg-transparent pl-2 shadow-none sm:flex-nowrap">
          <section
            className="text-black xl:max-w-[492px] dark:text-white"
            aria-labelledby="not-found-heading"
          >
            <h1
              id="not-found-heading"
              className="mb-8 hidden text-2xl font-medium leading-none sm:block sm:text-3xl md:text-3xl xl:text-5xl"
            >
              {t("heading")}
            </h1>
            <p className="mb-6 text-base leading-7 tracking-normal">
              {t("message")}
              <LocalizedLink
                href="/"
                className="font-semibold underline underline-offset-2"
              >
                {" "}
                {t("messageLink")}
              </LocalizedLink>
            </p>
            <p className="mb-2 text-base">{t("adventurous")}</p>
            <p className="max-w-[467px] text-base">
              <LocalizedLink
                href="/"
                className="font-medium underline underline-offset-2"
              >
                {t("redirectLink")}
              </LocalizedLink>
              <span> {t("redirectMessage")}</span>
            </p>
          </section>

          <div className="relative aspect-square w-full sm:ml-auto sm:aspect-[4/3] sm:max-w-[740px]">
            <Image
              src={nimaraCubeLogo}
              alt="Nimara Storefront logo"
              fill
              className="select-none object-contain sm:object-right"
              priority={true}
              draggable={false}
              sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 740px"
            />
            <span className="pointer-events-none absolute inset-0 flex select-none items-center justify-center">
              <span className="text-foreground -translate-y-6 text-[7.5rem] font-medium leading-[404px] lg:translate-x-[4.5rem] xl:text-[11.5rem] dark:text-white">
                404
              </span>
              <span className="absolute bottom-28 block text-2xl sm:hidden">
                {" "}
                {t("heading")}
              </span>
            </span>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
