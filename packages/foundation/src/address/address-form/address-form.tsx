"use client";

import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";

import { type AllCountryCode } from "@nimara/domain/consts";
import { type CountryOption } from "@nimara/domain/objects/Address";
import {
  type AddressFormRow,
  type FieldType,
} from "@nimara/domain/objects/AddressForm";
import { usePathname, useRouter } from "@nimara/i18n/routing";

import { AddressFormGenerator } from "./address-form-generator";

const COUNTRY_AREA = "countryArea";

const nameFormRow = [
  {
    name: "firstName",
    type: "text" as FieldType,
    isRequired: false,
    autoComplete: "given-name",
  },
  {
    name: "lastName",
    type: "text" as FieldType,
    isRequired: false,
    autoComplete: "family-name",
  },
];

const phoneCodeRow = [
  {
    name: "phone",
    type: "text" as FieldType,
    isRequired: false,
    inputMode: "tel",
    autoComplete: "tel",
  },
];

const companyNameRow = [
  {
    name: "companyName",
    type: "text" as FieldType,
    isRequired: false,
    autoComplete: "organization",
  },
];

interface AddressFormProps {
  addressFormRows: readonly AddressFormRow[];
  countries: CountryOption[];
  isDisabled?: boolean;
  onCountryChange?: (isChanging: boolean) => void;
  schemaPrefix?: string;
}

export const AddressForm = ({
  countries,
  addressFormRows,
  schemaPrefix,
  isDisabled,
  onCountryChange,
}: AddressFormProps) => {
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const form = useFormContext();
  const [isChangingCountry, setIsChangingCountry] = useState(false);

  const countryAreaFieldName = schemaPrefix
    ? `${schemaPrefix}.${COUNTRY_AREA}`
    : COUNTRY_AREA;

  useEffect(() => {
    if (!isChangingCountry || addressFormRows.length === 0) {
      return;
    }

    setIsChangingCountry(false);
    onCountryChange?.(false);

    const countryArea = form.getValues(countryAreaFieldName);
    const isStillSelectable = addressFormRows
      .flat()
      .find((field) => field.name === COUNTRY_AREA)
      ?.options?.some(({ value }) => value === countryArea);

    if (countryArea && !isStillSelectable) {
      form.resetField(countryAreaFieldName, {
        defaultValue: "",
        keepError: false,
      });
    }
  }, [addressFormRows]);

  const handleChangeCountry = (countryCode: AllCountryCode) => {
    setIsChangingCountry(true);
    onCountryChange?.(true);

    const params = new URLSearchParams(searchParams);

    params.set("country", countryCode);
    router.push(`${pathname}?${params.toString()}`);
  };

  const countrySelectorFormRow = [
    {
      name: "country",
      type: "select" as FieldType,
      isRequired: true,
      autoComplete: "country",
      onChange: handleChangeCountry,
      options: countries.map((country) => ({
        value: country.value,
        label: country.label ?? country.value,
      })),
    },
  ];

  let postalCode: AddressFormRow;
  let city: AddressFormRow;
  const formattedAddressFormRows: AddressFormRow[] = [];

  addressFormRows.forEach((row) => {
    if (row[0].name === "city") {
      city = row;
    }

    if (row[0].name === "postalCode") {
      postalCode = row;
    }
  });

  addressFormRows.forEach((row) => {
    if (!["postalCode", "city"].includes(row[0].name)) {
      return formattedAddressFormRows.push(row);
    }

    const isPostalRowHandled = formattedAddressFormRows.some((r) =>
      ["postalCode", "city"].includes(r[0].name),
    );

    if (isPostalRowHandled) {
      return;
    }

    if (city && postalCode) {
      return formattedAddressFormRows.push([...postalCode, ...city]);
    }

    if (!city && postalCode) {
      return formattedAddressFormRows.push(postalCode);
    }

    if (city && !postalCode) {
      return formattedAddressFormRows.push(city);
    }
  });

  return (
    <>
      <AddressFormGenerator
        isDisabled={isDisabled}
        schemaPrefix={schemaPrefix}
        addressFormRows={[
          nameFormRow,
          companyNameRow,
          countrySelectorFormRow,
          phoneCodeRow,
        ]}
      />
      {isChangingCountry && <p>{t("shipping-address.loading-fields")}</p>}
      <AddressFormGenerator
        isDisabled={isDisabled}
        schemaPrefix={schemaPrefix}
        addressFormRows={formattedAddressFormRows}
      />
    </>
  );
};
