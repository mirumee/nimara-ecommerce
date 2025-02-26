export const validateDomain = ({
  allowedSaleorDomain,
  saleorDomain,
}: {
  allowedSaleorDomain: string;
  saleorDomain: string;
}) => {
  if (saleorDomain !== allowedSaleorDomain) {
    throw new Error(
      `This is a single tenant Saleor App and can only be used with ${allowedSaleorDomain}.`,
    );
  }
};
