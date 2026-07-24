"use client";

import { useTranslations } from "next-intl";

import { type AllCountryCode } from "@nimara/domain/consts";
import { type CountryOption } from "@nimara/domain/objects/Address";
import { type AddressFormRow } from "@nimara/domain/objects/AddressForm";
import { type User } from "@nimara/domain/objects/User";
import { AddressForm } from "@nimara/foundation/address/address-form/address-form";
import type { FormattedAddress } from "@nimara/foundation/address/types";
import { CheckboxField } from "@nimara/foundation/form-components/checkbox-field";

import { AddressTab, type TabName } from "../tabs/address-tab";

type BillingAddressSectionProps = {
  activeTab: TabName;
  addressFormRows: readonly AddressFormRow[];
  countries: CountryOption[];
  countryCode: AllCountryCode;
  formattedAddresses: FormattedAddress[];
  isProcessing: boolean;
  isShippingRequired: boolean;
  /**
   * Fired by the guest address form when the billing country changes —
   * variants wire it to their processing lock so the form stays disabled
   * while the country-change redirect reloads the payment step.
   */
  onCountryChange: (isChanging: boolean) => void;
  sameAsShippingAddress: boolean;
  setActiveTab: (tab: TabName) => void;
  setIsCountryChanging: (value: boolean) => void;
  user: User | null;
};

/**
 * The billing address block: same-as-shipping toggle, then either the
 * saved-addresses tabs (signed-in) or a bare address form (guest).
 */
export const BillingAddressSection = ({
  activeTab,
  addressFormRows,
  countries,
  countryCode,
  formattedAddresses,
  isProcessing,
  isShippingRequired,
  onCountryChange,
  sameAsShippingAddress,
  setActiveTab,
  setIsCountryChanging,
  user,
}: BillingAddressSectionProps) => {
  const t = useTranslations();

  return (
    <div className="space-y-6">
      <h3 className="text-base font-normal leading-7 text-muted-foreground">
        {t("payment.billing-address")}
      </h3>

      {isShippingRequired && (
        <div className="flex w-full items-center gap-2 rounded-md border border-input bg-background px-4">
          <CheckboxField
            label={t("payment.same-as-shipping-address")}
            name="sameAsShippingAddress"
          />
        </div>
      )}

      {!sameAsShippingAddress &&
        (user ? (
          <AddressTab
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            addresses={formattedAddresses}
            addressFormRows={addressFormRows}
            countries={countries}
            countryCode={countryCode}
            isDisabled={isProcessing}
            setIsCountryChanging={setIsCountryChanging}
          />
        ) : (
          <AddressForm
            addressFormRows={addressFormRows}
            schemaPrefix="billingAddress"
            countries={countries}
            onCountryChange={onCountryChange}
            isDisabled={isProcessing}
          />
        ))}
    </div>
  );
};
