import { CACHE_TTL } from "@/config";
import { Footer } from "@/features/footer";
import { Header } from "@/features/header";
import { getLocalePrefix } from "@/foundation/server";
import { getServiceRegistry } from "@/services/registry";

import { Navigation } from "./_components/navigation";

export default async function Layout({ children }: LayoutProps<"/[locale]">) {
  const [localePrefix, services] = await Promise.all([
    getLocalePrefix(),
    getServiceRegistry(),
  ]);

  const cmsMenuService = await services.getCMSMenuService();
  const resultMenu = await cmsMenuService.menuGet({
    channel: services.region.market.channel,
    languageCode: services.region.language.code,
    locale: localePrefix,
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
      <div className="sticky top-0 isolate z-50 bg-background py-4 md:pb-0">
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
