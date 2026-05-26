export const getSaleorDomainFromApiUrl = (saleorApiUrl: string) =>
  new URL(saleorApiUrl).host;
