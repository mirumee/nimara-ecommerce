import type { LinesUpdateInfra, LinesUpdateUseCase } from "#root/cart/types";

export const linesUpdateUseCase = ({
  linesUpdateInfra,
}: {
  linesUpdateInfra: LinesUpdateInfra;
}): LinesUpdateUseCase => {
  return linesUpdateInfra;
};
