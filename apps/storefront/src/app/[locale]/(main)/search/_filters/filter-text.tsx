import { getTranslations } from "next-intl/server";

import type { Facet } from "@nimara/infrastructure/use-cases/search/types";
import { Toggle } from "@nimara/ui/components/toggle";

import { type TranslationMessage } from "@/types";

export const FilterText = async ({
  facet: { choices, name, slug, messageKey },
  searchParams,
}: {
  facet: Facet;
  searchParams: Record<string, string>;
}) => {
  const t = await getTranslations();
  const defaultValue = searchParams[slug]?.split(".") ?? [];
  const label = name ?? t(messageKey as TranslationMessage);

  return (
    <div className="flex flex-col space-y-4 py-2">
      {label && (
        <h3 className="text-base font-medium text-stone-700">{label}</h3>
      )}
      <div className="flex flex-wrap gap-2">
        {choices?.map((choice) => (
          <div key={choice.value}>
            <input
              type="checkbox"
              name={`group${slug}-${choice.value}`}
              id={`group${slug}-${choice.value}`}
              className="peer hidden"
              defaultChecked={defaultValue.includes(choice.value)}
            />
            <Toggle
              asChild
              defaultPressed={defaultValue.includes(choice.value)}
              className="flex items-center justify-center gap-2 rounded-sm text-stone-900"
              variant="outline"
            >
              <label
                htmlFor={`group${slug}-${choice.value}`}
                className="peer-checked:bg-accent cursor-pointer"
              >
                {choice.label}
              </label>
            </Toggle>
          </div>
        ))}
      </div>
    </div>
  );
};
