"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import React from "react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@nimara/ui/components/breadcrumb";

import { paths } from "@/lib/paths";

import { capitalize, formatSlugToText } from "../../../utils";

type ProductBreadcrumbsProps = {
  categorySlug: string;
  productName: string;
};

export const ProductBreadcrumbs = ({
  productName,
  categorySlug,
}: ProductBreadcrumbsProps) => {
  const searchParams = useSearchParams();
  const t = useTranslations();

  const from = searchParams.get("from");
  const [fromType, fromValue] = from?.split(":") ?? [];

  const crumbs = [
    {
      label: t("home.home"),
      href: "/",
    },
  ];

  if (fromType === "collection") {
    crumbs.push({
      label: formatSlugToText(fromValue),
      href: paths.collections.asPath({ slug: fromValue }),
    });
  } else if (fromType === "category") {
    crumbs.push({
      label: capitalize(fromValue),
      href: paths.search.asPath({ query: { category: fromValue } }),
    });
  } else if (fromType === "search") {
    crumbs.push({
      label: t("products.all-products"),
      href: paths.search.asPath(),
    });
  } else if (!from) {
    crumbs.push({
      label: capitalize(categorySlug),
      href: paths.search.asPath({ query: { category: categorySlug } }),
    });
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {crumbs.map((crumb) => (
          <React.Fragment key={crumb.href}>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href={crumb.href}>{crumb.label}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
          </React.Fragment>
        ))}

        <BreadcrumbItem>
          <BreadcrumbPage>{productName}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
};
