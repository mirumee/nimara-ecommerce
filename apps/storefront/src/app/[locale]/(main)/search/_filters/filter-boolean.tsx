"use client";

import { useState } from "react";

import type { Facet } from "@nimara/infrastructure/use-cases/search/types";
import { Checkbox } from "@nimara/ui/components/checkbox";
import { Label } from "@nimara/ui/components/label";

export const FilterBoolean = ({
  facet: { name, slug, messageKey },
  searchParams,
}: {
  facet: Facet;
  searchParams: Record<string, string>;
}) => {
  const isCheckedInitial = searchParams[slug] === "true";
  const [isChecked, setIsChecked] = useState(isCheckedInitial);

  const labelText = name ?? messageKey;
  const checkboxId = `boolean-${slug}`;

  return (
    <div className="flex items-center space-x-2">
      {/* Hidden input to ensure checkbox value is included in FormData */}
      <input type="hidden" name={slug} value={isChecked ? "true" : ""} />

      <Checkbox
        id={checkboxId}
        checked={isChecked}
        onCheckedChange={(checked) => {
          setIsChecked(checked === true);
        }}
      />

      <Label
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        htmlFor={checkboxId}
      >
        {labelText}
      </Label>
    </div>
  );
};
