"use client";

import { useTranslations } from "next-intl";

import { type CheckoutProblems } from "@nimara/domain/objects/Checkout";
import type { Line as LineType } from "@nimara/domain/objects/common";

import { Line, type LineProps } from "./line";

export type LinesProps = Pick<
  LineProps,
  "onLineDelete" | "onLineQuantityChange"
> & {
  isDisabled?: boolean;
  isLinesEditable?: boolean;
  lines: LineType[];
  problems: CheckoutProblems;
};

export const Lines = ({
  isLinesEditable = true,
  problems,
  ...props
}: LinesProps) => {
  const t = useTranslations();
  const linesWithProblems = [
    ...problems.insufficientStock,
    ...problems.variantNotAvailable,
  ];
  const lines = props.lines.filter(
    ({ id }) => !linesWithProblems.some(({ line }) => line.id === id),
  );

  return (
    <>
      <div className="flex flex-col gap-4 py-8">
        {lines.map((line) => (
          <Line
            key={line.id}
            line={line}
            {...props}
            isLineEditable={isLinesEditable}
          />
        ))}

        {linesWithProblems.map(({ line }) => (
          <>
            <h2 className="text-stone-500">{t("cart.unavailable-products")}</h2>
            <Line
              key={line.id}
              line={line}
              {...props}
              isLineEditable={true}
              isOutOfStock
            />
          </>
        ))}
      </div>
      <hr className="border-stone-200" />
    </>
  );
};
