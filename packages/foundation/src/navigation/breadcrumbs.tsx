"use client";

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
import { useLocalizedLink } from "@nimara/foundation/i18n/hooks/use-localized-link";

export const Breadcrumbs = ({
  crumbs,
  pageName,
  homePath,
}: {
  crumbs?: { href: string; label: string }[];
  pageName?: string;
  homePath: string;
}) => {
  const t = useTranslations("home");
  const LocalizedLink = useLocalizedLink();

  return (
    <div className="hidden md:block">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <LocalizedLink href={homePath}>
                {t("home")}
              </LocalizedLink>
            </BreadcrumbLink>
          </BreadcrumbItem>
          {(pageName || crumbs) && <BreadcrumbSeparator />}

          {crumbs &&
            crumbs.map((crumb) => (
              <React.Fragment key={crumb.href}>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <LocalizedLink href={crumb.href}>
                      {crumb.label}
                    </LocalizedLink>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </React.Fragment>
            ))}
          {pageName && (
            <BreadcrumbItem>
              <BreadcrumbPage>{pageName}</BreadcrumbPage>
            </BreadcrumbItem>
          )}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
};
