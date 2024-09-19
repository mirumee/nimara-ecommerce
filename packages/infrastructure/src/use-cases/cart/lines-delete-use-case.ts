import type {
  LinesDeleteInfra,
  LinesDeleteUseCase,
} from "#root/public/saleor/cart/types";

export const linesDeleteUseCase = ({
  linesDeleteInfra,
}: {
  linesDeleteInfra: LinesDeleteInfra;
}): LinesDeleteUseCase => {
  return linesDeleteInfra;
};
