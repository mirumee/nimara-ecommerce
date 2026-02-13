import type { Metadata } from "next";
import { type Locale } from "next-intl";

import { generateStandardCMSPageMetadata } from "@nimara/features/cms-page/shared/metadata/standard-metadata";
import { StandardCMSPageView } from "@nimara/features/cms-page/shop-basic-cms-page/standard";

import { getCurrentRegion } from "@/foundation/regions";
import { getServiceRegistry } from "@/services/registry";

type CMSPageProps = {
  params: Promise<{ locale: Locale; slug: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
};

export async function generateMetadata(props: CMSPageProps): Promise<Metadata> {
  const [services, region] = await Promise.all([
    getServiceRegistry(),
    getCurrentRegion(),
  ]);

  return generateStandardCMSPageMetadata({
    ...props,
    services,
    region,
    revalidateTime: services.config.cacheTTL.cms,
  });
}

export default async function Page(props: CMSPageProps) {
  const [services, region] = await Promise.all([
    getServiceRegistry(),
    getCurrentRegion(),
  ]);

  return (
    <StandardCMSPageView
      {...props}
      services={services}
      region={region}
      revalidateTime={services.config.cacheTTL.cms}
    />
  );
}
