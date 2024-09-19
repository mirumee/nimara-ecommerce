import { type Maybe } from "./types";

type checkSaleorData = (data: unknown, operation: string) => asserts data;

export const validateSaleorData: checkSaleorData = (
  data,
  operation,
): asserts data => {
  if (!data) {
    throw new Error(
      `Unexpected state. No data returned from Saleor in \`${operation}\` operation.`,
    );
  }
};

export const getTranslation = <T, K extends keyof T>(
  key: K,
  type: Maybe<
    {
      [key in K]?: Maybe<string>;
    } & { translation?: Maybe<{ [key in K]?: Maybe<string> }> }
  >,
) => type?.translation?.[key] || type?.[key] || "";
