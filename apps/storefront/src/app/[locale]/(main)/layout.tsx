import { type ReactNode } from "react";

import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { CACHE_TTL } from "@/config";
import { getStoreLocale } from "@/lib/server";
import { getCurrentRegion } from "@/regions/server";
import { cmsMenuService } from "@/services/cms";

import { Navigation } from "./_components/navigation";

export default async function Layout({ children }: { children: ReactNode }) {
  const region = await getCurrentRegion();
  const locale = await getStoreLocale();

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
      <main className="container flex h-screen flex-1 items-stretch">
        {children}
      </main>
      <Footer />
    </>
  );
}
