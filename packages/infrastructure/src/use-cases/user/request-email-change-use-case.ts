import type {
  RequestEmailChangeInfra,
  RequestEmailChangeUseCase,
} from "#root/public/saleor/user/types";

export const requestEmailChangeUseCase = ({
  requestEmailChangeInfra,
}: {
  requestEmailChangeInfra: RequestEmailChangeInfra;
}): RequestEmailChangeUseCase => {
  return requestEmailChangeInfra;
};
