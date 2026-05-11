"use client";

import type { PageField } from "@nimara/domain/objects/CMSPage";
import { LocalizedLink } from "@nimara/i18n/routing";
import { Button } from "@nimara/ui/components/button";

import { createFieldsMap, type FieldsMap } from "../utils/create-fields-map";

export interface HeroBannerProps {
  backgroundImageUrl?: string;
  fields: PageField[] | undefined;
  searchPath: string;
}

export const HeroBanner = ({
  backgroundImageUrl,
  fields,
  searchPath,
}: HeroBannerProps) => {
  if (!fields || fields.length === 0) {
    return null;
  }

  const fieldsMap: FieldsMap = createFieldsMap(fields);

  return (
    <div className="relative flex h-[27rem] items-center justify-center overflow-hidden border border-border bg-background transition-colors">
      {/* Background product image with 50% white overlay */}
      {backgroundImageUrl && (
        <div className="absolute inset-0" aria-hidden="true">
          <img
            alt=""
            src={backgroundImageUrl}
            className="absolute inset-0 size-full object-cover"
          />
          <div className="absolute inset-0 bg-background/50" />
        </div>
      )}

      {/* Visual grid columns — mirrors visualgridcontainer from Webflow */}
      <div
        className="absolute inset-0 flex"
        style={{ boxShadow: "1px 0 0 0 hsl(var(--border))" }}
      >
        {/* is_gradientsm + is_displayeddesktop */}
        <div
          className="hidden h-full flex-1 bg-gradient-to-t from-[5%] from-border to-[40%] to-transparent lg:block"
          style={{ boxShadow: "inset 1px 0 0 0 hsl(var(--border))" }}
        />
        {/* is_gradientmd */}
        <div
          className="h-full flex-1 bg-gradient-to-t from-[10%] from-border to-[70%] to-transparent"
          style={{ boxShadow: "inset 1px 0 0 0 hsl(var(--border))" }}
        />
        {/* is_gradientfull */}
        <div
          className="h-full flex-1 bg-gradient-to-b from-transparent to-[85%] to-border"
          style={{ boxShadow: "inset 1px 0 0 0 hsl(var(--border))" }}
        />
        {/* is_gradientfull */}
        <div
          className="h-full flex-1 bg-gradient-to-b from-transparent to-[85%] to-border"
          style={{ boxShadow: "inset 1px 0 0 0 hsl(var(--border))" }}
        />
        {/* is_gradientmd */}
        <div
          className="h-full flex-1 bg-gradient-to-t from-[10%] from-border to-[70%] to-transparent"
          style={{ boxShadow: "inset 1px 0 0 0 hsl(var(--border))" }}
        />
        {/* is_gradientsm + is_displayeddesktop */}
        <div
          className="hidden h-full flex-1 bg-gradient-to-t from-[5%] from-border to-[40%] to-transparent lg:block"
          style={{ boxShadow: "inset 1px 0 0 0 hsl(var(--border))" }}
        />
      </div>

      <div className="relative z-10 p-8 text-center lg:p-16">
        <h6 className="pb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          OPEN-SOURCE STOREFRONT
        </h6>
        <h1 className="mx-auto max-w-[720px] pb-4 text-3xl font-normal leading-tight text-foreground lg:text-5xl">
          The Marketplace-Ready Storefront Blueprint
        </h1>
        <div className="flex justify-center gap-3">
          <Button asChild>
            <LocalizedLink href={searchPath}>Browse the shop</LocalizedLink>
          </Button>
          <Button asChild variant="outline">
            <a
              href="https://github.com/mirumee/nimara-ecommerce"
              target="_blank"
              rel="noopener noreferrer"
            >
              Get the source code
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
};
