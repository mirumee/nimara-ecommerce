import { ok } from "@nimara/domain/objects/Result";

import { getGatewayCustomerMetaKey } from "../../helpers";
import type { CustomerFromSaleorGetInfra } from "../../types";

export const customerFromSaleorGetInfra: CustomerFromSaleorGetInfra = ({
  user,
  channel,
}) =>
  ok(
    user.metadata[getGatewayCustomerMetaKey({ gateway: "stripe", channel })] ??
      null,
  );
