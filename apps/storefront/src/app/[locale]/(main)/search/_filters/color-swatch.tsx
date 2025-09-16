import { getTranslations } from "next-intl/server";

import type { Facet } from "@nimara/infrastructure/use-cases/search/types";
import { Toggle } from "@nimara/ui/components/toggle";

import { cn } from "@/lib/utils";
import type { TranslationMessage } from "@/types";

export const colors = [
  "yellow",
  "black",
  "white",
  "beige",
  "brown",
  "grey",
  "coffee",
  "red",
  "green",
  "blue",
] as const;
export type ColorValue = (typeof colors)[number];

const COLORS_MAPPING = {
  beige: "bg-[#f5f5dc]",
  black: "bg-black",
  blue: "bg-[#52a9f5]",
  brown: "bg-[#8b4513]",
  coffee: "bg-[#7f540f]",
  green: "bg-[#4dd273]",
  grey: "bg-[#808080]",
  purple: "bg-[#a45ee5]",
  red: "bg-[#f62c2c]",
  silver: "bg-[#c0c0c0]",
  white: "bg-white",
  yellow: "bg-[#fffa4B]",
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
        <h3 className="dark:text-muted-foreground text-base font-medium text-stone-700">
          {label}
        </h3>
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
              className="text-primary flex items-center justify-center gap-2 rounded-sm"
              variant="outline"
            >
              <label
                htmlFor={`group${slug}-${choice.value}`}
                className="peer-checked:bg-accent cursor-pointer"
              >
                <div
                  className={cn(
                    "h-6 w-6 border border-stone-200",
                    COLORS_MAPPING[choice.value.toLowerCase() as ColorValue],
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
