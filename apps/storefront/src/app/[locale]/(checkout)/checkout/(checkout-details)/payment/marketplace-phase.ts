export type MarketplacePhase = "prepare" | "confirm";

export const canProceedMarketplacePayment = ({
  clientSecret,
  isLoading,
  isMounted,
  orderIdsCount,
  phase,
}: {
  clientSecret: string | null;
  isLoading: boolean;
  isMounted: boolean;
  orderIdsCount: number;
  phase: MarketplacePhase;
}) => {
  if (phase === "prepare") {
    return !isLoading;
  }

  return !isLoading && isMounted && !!clientSecret && orderIdsCount > 0;
};
