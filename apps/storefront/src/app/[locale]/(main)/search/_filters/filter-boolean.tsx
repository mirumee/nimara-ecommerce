import { getTranslations } from "next-intl/server";

import type { Facet } from "@nimara/infrastructure/use-cases/search/types";
import { Checkbox } from "@nimara/ui/components/checkbox";
import { Label } from "@nimara/ui/components/label";

import { type TranslationMessage } from "@/types";

export const FilterBoolean = async ({
  facet: { name, slug, messageKey },
  searchParams,
}: {
  facet: Facet;
  searchParams: Record<string, string>;
}) => {
  const t = await getTranslations();
  const defaultValue = searchParams[slug] ?? "false";

  return (
    <div className="flex items-center space-x-2">
      <Checkbox
        defaultChecked={defaultValue === "true"}
        id={name}
        name={slug}
        value="true"
      />
      <Label
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        htmlFor={name}
      >
        {name ?? t(messageKey as TranslationMessage)}
      </Label>
    </div>
  );
};
