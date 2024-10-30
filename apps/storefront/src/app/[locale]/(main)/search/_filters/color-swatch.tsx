import { getTranslations } from "next-intl/server";

import type { Facet } from "@nimara/infrastructure/use-cases/search/types";
import { Toggle } from "@nimara/ui/components/toggle";

import { cn } from "@/lib/utils";
import type { TranslationMessage } from "@/types";

import type { ColorValue } from "./filters-container";

const colors: Record<ColorValue, string> = {
  yellow: "bg-[#fffa4B]",
  black: "bg-black",
  white: "bg-white",
  beige: "bg-[#dbc1a3]",
  grey: "bg-[#808080]",
  khaki: "bg-[#c3b091]",
  pink: "bg-[#ff9ac6]",
  red: "bg-[#e50101]",
  green: "bg-[#339f2b]",
};

export const ColorSwatch = async ({
  facet: { choices, name, slug, messageKey },
  searchParams,
}: {
  facet: Facet;
  searchParams: Record<string, string>;
}) => {
  const t = await getTranslations();
  const label = name ?? t(messageKey as TranslationMessage);
  const defaultValue = searchParams[slug]?.split(".") ?? [];

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
                className="cursor-pointer peer-checked:bg-accent"
              >
                <div
                  className={cn(
                    "h-6 w-6 border border-stone-200",
                    colors[choice.value as ColorValue],
                  )}
                />
                {choice.label}
              </label>
            </Toggle>
          </div>
        ))}
      </div>
    </div>
  );
};
