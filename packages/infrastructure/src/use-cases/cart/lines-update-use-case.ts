import type {
  LinesUpdateInfra,
  LinesUpdateUseCase,
} from "#root/public/saleor/cart/types";

export const linesUpdateUseCase = ({
  linesUpdateInfra,
}: {
  linesUpdateInfra: LinesUpdateInfra;
}): LinesUpdateUseCase => {
  return linesUpdateInfra;
};
