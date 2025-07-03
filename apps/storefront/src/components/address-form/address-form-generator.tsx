import { useTranslations } from "next-intl";

import {
  type AddressFormField,
  type AddressFormRow,
} from "@nimara/domain/objects/AddressForm";

import { SelectFormField } from "@/components/form/select-form-field";
import { TextFormField } from "@/components/form/text-form-field";
import { generateFieldPrefix } from "@/lib/form/utils";
import { cn } from "@/lib/utils";
import { type GetTranslations, type TranslationMessage } from "@/types";

const renderInput = ({
  field,
  t,
  schemaPrefix,
  isDisabled = false,
}: {
  field: AddressFormField;
  isDisabled?: boolean;
  schemaPrefix?: string;
  t: GetTranslations<"address">;
}) => {
  const withSchemaPrefix = generateFieldPrefix(schemaPrefix);

  const localField = {
    ...field,
    disabled: isDisabled,
    name: withSchemaPrefix(field.name),
    label: t((field.label ?? field.name) as TranslationMessage<"address">),
  };

  switch (field.type) {
    case "select":
      return <SelectFormField {...localField} />;
    case "text":
      return <TextFormField {...localField} />;
    default:
      // according to docs https://github.com/typescript-eslint/typescript-eslint/issues/3069
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      throw new Error(`Unknown input type: ${field.type}`);
  }
};

export const AddressFormGenerator = ({
  addressFormRows,
  schemaPrefix,
  isDisabled,
}: {
  addressFormRows: AddressFormRow[];
  isDisabled?: boolean;
  schemaPrefix?: string;
}) => {
  const t = useTranslations("address");

  return (
    <div
      className={cn("space-y-2", {
        "pointer-events-none opacity-70 [&_button]:bg-stone-50 [&_input]:bg-stone-50":
          isDisabled,
      })}
    >
      {addressFormRows.map((formRow) => (
        <div key={formRow[0].name} className="flex gap-2">
          {formRow.map((field) => (
            <div className="w-full" key={field.name}>
              {renderInput({ field, t, schemaPrefix, isDisabled })}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};
