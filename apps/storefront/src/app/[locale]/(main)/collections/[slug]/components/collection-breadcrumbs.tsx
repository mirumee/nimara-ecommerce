import Link from "next/link";
import { getTranslations } from "next-intl/server";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@nimara/ui/components/breadcrumb";

import { formatSlugToText } from "../../../utils";
type CollectionBreadcrumbsProps = {
  collectionSlug: string;
};

export const CollectionBreadcrumbs = async ({
  collectionSlug,
}: CollectionBreadcrumbsProps) => {
  const t = await getTranslations("home");

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/">{t("home")}</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>{formatSlugToText(collectionSlug)}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
};
