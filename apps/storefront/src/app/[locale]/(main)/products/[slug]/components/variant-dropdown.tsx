import { CheckIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useWindowSize } from "usehooks-ts";

import type { ProductVariant } from "@nimara/domain/objects/Product";
import { Button } from "@nimara/ui/components/button";
import { Label } from "@nimara/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@nimara/ui/components/select";
import { Sheet, SheetContent } from "@nimara/ui/components/sheet";
import { screenSizes } from "@nimara/ui/consts";

import { cn } from "@/lib/utils";

type VariantDropdownProps = {
  onVariantSelect: (variantId: string) => void;
  selectedVariantId: string;
  variants: ProductVariant[];
};

export const VariantDropdown = ({
  onVariantSelect,
  selectedVariantId,
  variants,
}: VariantDropdownProps) => {
  const t = useTranslations("products");
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const { width } = useWindowSize();

  const isSmDown = width && width < screenSizes.sm;

  useEffect(() => {
    /**
     * Close the sheet if it is open and the screen is bigger than sm.
     */
    if (isSheetOpen && !isSmDown) {
      setIsSheetOpen(false);
    }
  }, [width]);

  return (
    <>
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent side="bottom">
          <ul>
            {variants.map(({ id, ...variant }) => (
              <li
                key={id}
                className="flex cursor-pointer"
                onClick={() => {
                  onVariantSelect(id);
                  setIsSheetOpen(false);
                }}
              >
                <Button variant="ghost" className="w-full justify-start p-1.5">
                  <CheckIcon
                    className={cn("invisible mr-2 h-auto w-[20px]", {
                      visible: selectedVariantId === id,
                    })}
                  />
                  {variant.name}
                </Button>
              </li>
            ))}
          </ul>
        </SheetContent>
      </Sheet>

      <Label id="variant-select-label">{t("variant-select")}</Label>
      <Select
        disabled={!variants.length}
        open={isSmDown ? false : undefined}
        onValueChange={(variantId) => onVariantSelect(variantId)}
        onOpenChange={() => isSmDown && setIsSheetOpen(true)}
        value={
          variants.length && selectedVariantId ? selectedVariantId : undefined
        }
        aria-expanded={isSheetOpen}
        aria-controls="variant-select-options"
      >
        <SelectTrigger className="mt-1" aria-labelledby="variant-select-label">
          <SelectValue placeholder={t("variant-select")} />
        </SelectTrigger>
        <SelectContent>
          {variants.map(({ id, name }) => (
            <SelectItem key={id} value={id}>
              {name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </>
  );
};
