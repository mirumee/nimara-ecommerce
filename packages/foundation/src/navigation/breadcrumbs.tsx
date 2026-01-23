"use client";

import { useTranslations } from "next-intl";
import React from "react";

import { Link as LocalizedLink } from "@nimara/i18n/routing";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@nimara/ui/components/breadcrumb";

export const Breadcrumbs = ({
  crumbs,
  pageName,
  homePath,
}: {
  crumbs?: { href: string; label: string }[];
  homePath: string;
  pageName?: string;
}) => {
  const t = useTranslations("home");

  return (
    <div className="hidden md:block">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <LocalizedLink href={homePath}>{t("home")}</LocalizedLink>
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
