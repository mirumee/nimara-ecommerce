import { type CheckoutProblems } from "@nimara/domain/objects/Checkout";
import type { Line } from "@nimara/domain/objects/common";

/**
 * Splits cart lines into available lines and lines that have checkout
 * problems (insufficient stock or variant no longer available).
 */
export const splitLinesByProblems = (
  lines: Line[],
  problems: CheckoutProblems,
): { availableLines: Line[]; linesWithProblems: Line[] } => {
  const problemLineIds = new Set<string>([
    ...problems.insufficientStock.map(({ line }) => line.id),
    ...problems.variantNotAvailable.map(({ line }) => line.id),
  ]);

  const availableLines: Line[] = [];
  const linesWithProblems: Line[] = [];

  for (const line of lines) {
    if (problemLineIds.has(line.id)) {
      linesWithProblems.push(line);
    } else {
      availableLines.push(line);
    }
  }

  return { availableLines, linesWithProblems };
};

/**
 * Groups cart lines by their product's `vendorId`. Lines without a
 * `vendorId` are skipped.
 */
export const groupLinesByVendorId = (
  lines: Line[],
): Record<string, Line[]> => {
  return lines.reduce<Record<string, Line[]>>((acc, line) => {
    const vendorId = line.product.vendorId;

    if (!vendorId) {
      return acc;
    }

    if (!acc[vendorId]) {
      acc[vendorId] = [];
    }

    acc[vendorId].push(line);

    return acc;
  }, {});
};
