import { type Checkout } from "@nimara/domain/objects/Checkout";

interface DeliveryMethodOption {
  description: string;
  label: string;
  value: string;
}

interface GetDeliveryMethodOptionsPayload {
  getDescription: (method: Checkout["shippingMethods"][number]) => string;
  shippingMethods: Checkout["shippingMethods"];
}

export const getDeliveryMethodOptions = ({
  shippingMethods,
  getDescription,
}: GetDeliveryMethodOptionsPayload): DeliveryMethodOption[] => {
  return shippingMethods.map((method) => ({
    label: method.name,
    value: method.id,
    description: getDescription(method),
  }));
};
