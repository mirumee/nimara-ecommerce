import { getGatewayCustomerMetaKey } from "../helpers";
import type { CustomerFromSaleorGetInfra } from "../types";

export const customerFromSaleorGetInfra: CustomerFromSaleorGetInfra = ({
  user,
  channel,
}) => {
  return (
    user.metadata[getGatewayCustomerMetaKey({ gateway: "stripe", channel })] ??
    null
  );
};
