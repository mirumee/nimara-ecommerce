import Image from "next/image";
import Link from "next/link";

import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { CACHE_TTL } from "@/config";
import { getLocalePrefix } from "@/lib/server";
import { getCurrentRegion } from "@/regions/server";
import { cmsMenuService } from "@/services/cms";

import { Navigation } from "./(main)/_components/navigation";

export default async function NotFound() {
  const [region, locale] = await Promise.all([
    getCurrentRegion(),
    getLocalePrefix(),
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
              Oops! Page Not Found
            </h1>
            <p className="mb-6 text-base leading-7 tracking-normal">
              Looks like you’ve hit a dead end, but don’t worry, we’ve got a
              <Link
                href="/"
                className="font-semibold underline underline-offset-2"
              >
                {" "}
                map!
              </Link>
            </p>
            <p className="mb-2 text-base">
              Or, if you’re feeling adventurous...
            </p>
            <p className="max-w-[467px] text-base">
              <Link
                href="/"
                className="font-medium underline underline-offset-2"
              >
                Click here
              </Link>
              <span>
                {" "}
                to discover a random page – who knows where you’ll end up?
              </span>
            </p>
          </section>

          <div className="relative aspect-square w-full sm:ml-auto sm:aspect-[4/3] sm:max-w-[740px]">
            <Image
              src="/cube.png"
              alt="Cube Logo"
              fill
              className="select-none object-contain sm:object-right"
              priority={true}
              draggable={false}
            />
            <span className="pointer-events-none absolute inset-0 flex select-none items-center justify-center">
              <span className="-translate-y-6 text-[7.5rem] font-medium leading-[404px] text-[#1C1917] lg:translate-x-[4.5rem] xl:text-[11.5rem] dark:text-white">
                404
              </span>
              <span className="absolute bottom-28 block text-2xl sm:hidden">
                {" "}
                Oops! Page Not Found
              </span>
            </span>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
