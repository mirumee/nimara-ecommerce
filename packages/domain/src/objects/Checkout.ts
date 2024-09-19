import type { Address } from "./Address";
import type { Line, Price, TaxedMoney } from "./common";

export type Checkout = {
  authorizeStatus: CheckoutAuthorizeStatusEnum;
  availablePaymentGateways: PaymentGateway[];
  billingAddress: Address | null;
  chargeStatus: CheckoutChargeStatusEnum;
  deliveryMethod: DeliveryMethod | null;
  discount: Price | null;
  displayGrossPrices: boolean;
  email: string | null;
  id: string;
  lines: Line[];
  problems: {
    insufficientStock: CheckoutLineProblemInsufficientStock[];
  };
  shippingAddress: Address | null;
  shippingMethods: ShippingMethod[];
  shippingPrice: TaxedMoney;
  subtotalPrice: TaxedMoney;
  totalPrice: TaxedMoney;
  voucherCode: string | null;
};

type PaymentGateway = {
  config: {
    field: string;
    value: string | null;
  }[];
  id: string;
  name: string;
};

type DeliveryMethod = {
  __typename: "Warehouse" | "ShippingMethod";
  id: string;
  name: string;
};

type ShippingMethod = {
  id: string;
  name: string;
  price: Price;
};

export type CheckoutAuthorizeStatusEnum = "FULL" | "NONE" | "PARTIAL";

export type CheckoutChargeStatusEnum =
  | "FULL"
  | "NONE"
  | "OVERCHARGED"
  | "PARTIAL";

export type CheckoutLineProblemInsufficientStock = {
  availableQuantity: number | null;
  line: Line;
};
