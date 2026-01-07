"use client";

import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";

import type { PageField } from "@nimara/domain/objects/CMSPage";
import { Button } from "@nimara/ui/components/button";
import { useLocalizedLink } from "@nimara/foundation/i18n/hooks/use-localized-link";

import { createFieldsMap, type FieldsMap } from "../utils/create-fields-map";

export interface HeroBannerProps {
    fields: PageField[] | undefined;
    searchPath: string;
}

export const HeroBanner = ({
    fields,
    searchPath,
}: HeroBannerProps) => {
    const t = useTranslations("home");
    const LocalizedLink = useLocalizedLink();

    if (!fields || fields.length === 0) {
        return null;
    }

    const fieldsMap: FieldsMap = createFieldsMap(fields);

    const header = fieldsMap["homepage-banner-header"]?.text;
    const buttonText = fieldsMap["homepage-banner-button-text"]?.text;
    const image = fieldsMap["homepage-banner-image"]?.imageUrl;

    return (
        <div className="bg-muted mb-14 flex flex-col items-center sm:h-[27rem] sm:flex-row">
            <div className="order-last p-8 sm:order-first sm:basis-1/2 lg:p-16">
                <h1 className="pb-8 text-3xl font-medium lg:text-5xl">{header}</h1>
                <Button asChild className="dark:hover:bg-stone-100">
                    <LocalizedLink href={searchPath}>
                        {buttonText}
                        <ArrowRight className="h-4 w-5 pl-1" />
                    </LocalizedLink>
                </Button>
            </div>
            <div className="sm-order-last relative order-first h-[22rem] w-full sm:h-[27rem] sm:basis-1/2">
                <Image
                    src={image ?? ""}
                    alt={t("hero-banner-alt")}
                    sizes="(max-width: 720px) 100vw, 50vw"
                    priority
                    fill
                    className="object-cover"
                />
            </div>
        </div>
    );
};
