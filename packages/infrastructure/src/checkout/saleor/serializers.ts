import { type CheckoutProblems } from "@nimara/domain/objects/Checkout";
import { type PriceType } from "@nimara/domain/objects/common";

import { serializeLine } from "#root/utils";

import { type CheckoutProblemsFragment } from "./graphql/fragments/generated";

export const serializeCheckoutProblems = (
  data: CheckoutProblemsFragment[] | null,
  priceType: PriceType,
): CheckoutProblems => {
  if (!data) {
    return {
      insufficientStock: [],
      variantNotAvailable: [],
    };
  }

  return data.reduce<CheckoutProblems>(
    (acc, problem) => {
      switch (problem.__typename) {
        case "CheckoutLineProblemInsufficientStock":
          acc.insufficientStock.push({
            line: serializeLine(problem.line, priceType),
            availableQuantity: problem.availableQuantity,
          });
          break;
        case "CheckoutLineProblemVariantNotAvailable":
          acc.variantNotAvailable.push({
            line: serializeLine(problem.line, priceType),
          });
          break;
        default:
          // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
          console.error(`Unknown checkout problem type: ${problem}`);

          break;
      }

      return acc;
    },
    {
      insufficientStock: [],
      variantNotAvailable: [],
    },
  );
};
