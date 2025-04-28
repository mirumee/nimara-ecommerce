import type {
  RequestEmailChangeInfra,
  RequestEmailChangeUseCase,
} from "#root/user/types";

export const requestEmailChangeUseCase = ({
  requestEmailChangeInfra,
}: {
  requestEmailChangeInfra: RequestEmailChangeInfra;
}): RequestEmailChangeUseCase => {
  return requestEmailChangeInfra;
};
