import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { clientEnvs } from "@/envs/client";
import { StandardHomeView } from "@/home/views/standard";
import { type SupportedLocale } from "@/regions/types";

type PageProps = {
  params: Promise<{ locale: SupportedLocale }>;
  searchParams: Promise<Record<string, string>>;
};

export async function generateMetadata(_params: PageProps): Promise<Metadata> {
  const t = await getTranslations("home");

  const url = new URL(clientEnvs.NEXT_PUBLIC_STOREFRONT_URL);
  const canonicalUrl = url.toString();

  return {
    title: t("title"),
    description: t("description"),
    openGraph: {
      images: [
        {
          url: "/og-hp.png",
          width: 1200,
          height: 630,
          alt: t("homepage-preview"),
        },
      ],
      url: canonicalUrl,
      siteName: "Nimara Store",
    },
  };
}

export default StandardHomeView;
