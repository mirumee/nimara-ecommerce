"use client";

import { useTranslations } from "next-intl";

import { type CheckoutProblems } from "@nimara/domain/objects/Checkout";
import type { Line as LineType } from "@nimara/domain/objects/common";

import { groupLinesByVendorId, splitLinesByProblems } from "../helpers";
import { Line, type LineProps } from "./line";

export type LinesProps = Pick<
  LineProps,
  "onLineDelete" | "onLineQuantityChange" | "getProductUrl"
> & {
  isDisabled?: boolean;
  isLinesEditable?: boolean;
  isMarketplaceEnabled?: boolean;
  lines: LineType[];
  problems: CheckoutProblems;
  vendorIdNames?: Record<string, string>;
};

export const Lines = ({
  isLinesEditable = true,
  problems,
  isMarketplaceEnabled,
  vendorIdNames,
  ...props
}: LinesProps) => {
  const t = useTranslations();

  const { availableLines, linesWithProblems } = splitLinesByProblems(
    props.lines,
    problems,
  );

  if (isMarketplaceEnabled) {
    const availableByVendor = groupLinesByVendorId(availableLines);
    const problemsByVendor = groupLinesByVendorId(linesWithProblems);
    const vendorIds = Array.from(
      new Set([
        ...Object.keys(availableByVendor),
        ...Object.keys(problemsByVendor),
      ]),
    );

    return (
      <div className="flex flex-col gap-8 py-8">
        {vendorIds.map((vendorId, index) => {
          const vendorAvailableLines = availableByVendor[vendorId] ?? [];
          const vendorProblemLines = problemsByVendor[vendorId] ?? [];

          return (
            <div key={vendorId} className="grid gap-4">
              <div className="flex w-full items-start justify-between gap-2">
                <div className="grid">
                  <span className="text-muted-foreground">
                    Sells and delivered by
                  </span>
                  <span className="text-primary font-medium">
                    {vendorIdNames?.[vendorId] ?? vendorId}
                  </span>
                </div>

                <div className="border-full bg-primary text-secondary rounded-full border-stone-200 px-2 py-1 text-xs">
                  Order {index + 1} of {vendorIds.length}
                </div>
              </div>

              {vendorAvailableLines.map((line) => (
                <Line
                  key={line.id}
                  line={line}
                  {...props}
                  isLineEditable={isLinesEditable}
                />
              ))}

              {vendorProblemLines.length > 0 && (
                <>
                  <h2 className="text-stone-500">
                    {t("cart.unavailable-products")}
                  </h2>
                  {vendorProblemLines.map((line) => (
                    <Line
                      key={line.id}
                      line={line}
                      {...props}
                      isLineEditable
                      isOutOfStock
                    />
                  ))}
                </>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-4 py-8">
        {availableLines.map((line) => (
          <Line
            key={line.id}
            line={line}
            {...props}
            isLineEditable={isLinesEditable}
          />
        ))}

        {linesWithProblems.length > 0 && (
          <>
            <h2 className="text-stone-500">{t("cart.unavailable-products")}</h2>
            {linesWithProblems.map((line) => (
              <Line
                key={line.id}
                line={line}
                {...props}
                isLineEditable
                isOutOfStock
              />
            ))}
          </>
        )}
      </div>
      <hr className="border-stone-200" />
    </>
  );
};
