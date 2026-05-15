"use client";

import { useEffect, useState } from "react";

import type { PageField } from "@nimara/domain/objects/CMSPage";
import { LocalizedLink } from "@nimara/i18n/routing";
import { Button } from "@nimara/ui/components/button";

import { createFieldsMap, type FieldsMap } from "../utils/create-fields-map";

const ANIMATED_PHRASES = [
  "open-source storefront",
  "built on Next.js & Saleor",
  "architected to scale",
] as const;

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
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setPhraseIndex((i) => (i + 1) % ANIMATED_PHRASES.length);
        setVisible(true);
      }, 350);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  if (!fields || fields.length === 0) {
    return null;
  }

  const fieldsMap: FieldsMap = createFieldsMap(fields);

  return (
    <div className="border-border bg-background relative flex h-[27rem] items-center justify-center overflow-hidden border transition-colors">
      {/* Background product image with 50% white overlay */}
      {backgroundImageUrl && (
        <div className="absolute inset-0" aria-hidden="true">
          <img
            alt=""
            src={backgroundImageUrl}
            className="absolute inset-0 size-full object-cover"
          />
          <div className="bg-background/50 absolute inset-0" />
        </div>
      )}

      {/* Visual grid columns — mirrors visualgridcontainer from Webflow */}
      <div
        className="absolute inset-0 flex"
        style={{ boxShadow: "1px 0 0 0 hsl(var(--border))" }}
      >
        {/* is_gradientsm + is_displayeddesktop */}
        <div
          className="from-border hidden h-full flex-1 bg-gradient-to-t from-[5%] to-transparent to-[40%] lg:block"
          style={{ boxShadow: "inset 1px 0 0 0 hsl(var(--border))" }}
        />
        {/* is_gradientmd */}
        <div
          className="from-border h-full flex-1 bg-gradient-to-t from-[10%] to-transparent to-[70%]"
          style={{ boxShadow: "inset 1px 0 0 0 hsl(var(--border))" }}
        />
        {/* is_gradientfull */}
        <div
          className="to-border h-full flex-1 bg-gradient-to-b from-transparent to-[85%]"
          style={{ boxShadow: "inset 1px 0 0 0 hsl(var(--border))" }}
        />
        {/* is_gradientfull */}
        <div
          className="to-border h-full flex-1 bg-gradient-to-b from-transparent to-[85%]"
          style={{ boxShadow: "inset 1px 0 0 0 hsl(var(--border))" }}
        />
        {/* is_gradientmd */}
        <div
          className="from-border h-full flex-1 bg-gradient-to-t from-[10%] to-transparent to-[70%]"
          style={{ boxShadow: "inset 1px 0 0 0 hsl(var(--border))" }}
        />
        {/* is_gradientsm + is_displayeddesktop */}
        <div
          className="from-border hidden h-full flex-1 bg-gradient-to-t from-[5%] to-transparent to-[40%] lg:block"
          style={{ boxShadow: "inset 1px 0 0 0 hsl(var(--border))" }}
        />
      </div>

      <div className="relative z-10 p-8 text-center lg:p-16">
        <h1 className="text-foreground mx-auto max-w-[720px] pb-4 text-3xl leading-tight font-normal lg:text-5xl">
          <span>Nimara is </span>
          <span
            className="inline-block transition-all duration-300"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(-8px)",
            }}
          >
            {ANIMATED_PHRASES[phraseIndex]}
          </span>
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

      {/* Bottom banner strip */}
      <div className="bg-border absolute bottom-0 left-0 right-0 z-10 flex items-center">
        <div className="flex w-full flex-col gap-1 pb-8 pr-8 sm:flex-row sm:items-center sm:gap-2 sm:px-8 sm:py-0">
          <p className="text-muted-foreground ml-8 mt-8 shrink-0 text-2xl font-normal leading-none sm:ml-0 sm:mt-0 sm:whitespace-nowrap">
            Nimara is
          </p>
          <div className="relative w-full overflow-hidden sm:min-w-0 sm:flex-1">
            <p
              className="text-foreground ml-8 text-2xl font-normal leading-none transition-all duration-300 sm:my-8 sm:ml-0"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(-8px)",
              }}
            >
              {ANIMATED_PHRASES[phraseIndex]}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
