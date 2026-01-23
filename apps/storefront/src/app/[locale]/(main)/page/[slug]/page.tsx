import type { Metadata } from "next";

import { generateStandardCMSPageMetadata } from "@nimara/features/cms-page/shared/metadata/standard-metadata";
import { StandardCMSPageView } from "@nimara/features/cms-page/shop-basic-cms-page/standard";
import { type SupportedLocale } from "@nimara/i18n/config";

import { getServiceRegistry } from "@/services/registry";

type CMSPageProps = {
  params: Promise<{ locale: SupportedLocale; slug: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
};

export async function generateMetadata(props: CMSPageProps): Promise<Metadata> {
  const services = await getServiceRegistry();

  return generateStandardCMSPageMetadata({
    ...props,
    services,
  });
}

export default async function Page(props: CMSPageProps) {
  const services = await getServiceRegistry();

  return <StandardCMSPageView {...props} services={services} />;
}
