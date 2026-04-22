import { useTranslations } from "next-intl";
import { type PropsWithChildren } from "react";

import { type Checkout } from "@nimara/domain/objects/Checkout";
import { displayFormattedAddressLines } from "@nimara/foundation/address/address";

import { CheckoutSection } from "../checkout-section";

interface CheckoutShippingAddressSectionProps {
  checkout: Checkout;
  formattedShippingAddress: string[] | null;
  isOpen: boolean;
}

export const CheckoutShippingAddressSection = ({
  checkout,
  formattedShippingAddress,
  isOpen,
  children,
}: PropsWithChildren<CheckoutShippingAddressSectionProps>) => {
  const t = useTranslations();

  return (
    <CheckoutSection
      isComplete={checkout.shippingAddress !== null}
      step="shipping-address"
      title={t("shipping-address.title")}
      isOpen={isOpen}
      collapsedSummary={
        checkout.shippingAddress && formattedShippingAddress ? (
          <div className="text-sm text-muted-foreground">
            {displayFormattedAddressLines({
              addressId: checkout.shippingAddress.id,
              formattedAddress: formattedShippingAddress,
            })}
          </div>
        ) : null
      }
    >
      {children}
    </CheckoutSection>
  );
};
