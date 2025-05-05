import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { getTranslations } from "next-intl/server";

import type { PageField } from "@nimara/domain/objects/CMSPage";
import { Button } from "@nimara/ui/components/button";

import { Link } from "@/i18n/routing";
import { createFieldsMap, type FieldsMap } from "@/lib/cms";
import { paths } from "@/lib/paths";

export const HeroBanner = async ({
  fields,
}: {
  fields: PageField[] | undefined;
}) => {
  const t = await getTranslations("home");

  if (!fields || fields.length === 0) {
    return null;
  }

  const fieldsMap: FieldsMap = createFieldsMap(fields);

  const header = fieldsMap["homepage-banner-header"]?.text;
  const buttonText = fieldsMap["homepage-banner-button-text"]?.text;
  const image = fieldsMap["homepage-banner-image"]?.imageUrl;

  return (
    <div className="mb-14 flex flex-col items-center bg-stone-100 sm:h-[27rem] sm:flex-row">
      <div className="order-last p-8 sm:order-first sm:basis-1/2 lg:p-16">
        <h1 className="pb-8 text-3xl font-medium lg:text-5xl">{header}</h1>
        <Button asChild>
          <Link href={paths.search.asPath()}>
            {buttonText}
            <ArrowRight className="h-4 w-5 pl-1" />
          </Link>
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
