import type { LinesDeleteInfra, LinesDeleteUseCase } from "#root/cart/types";

export const linesDeleteUseCase = ({
  linesDeleteInfra,
}: {
  linesDeleteInfra: LinesDeleteInfra;
}): LinesDeleteUseCase => {
  return linesDeleteInfra;
};
