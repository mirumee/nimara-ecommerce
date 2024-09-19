import { useTranslations } from "next-intl";
import { type getTranslations } from "next-intl/server";

import {
  type AddressFormField,
  type AddressFormRow,
} from "@nimara/domain/objects/AddressForm";

import { SelectFormField } from "@/components/form/select-form-field";
import { TextFormField } from "@/components/form/text-form-field";
import { generateFieldPrefix } from "@/lib/form/utils";
import { cn } from "@/lib/utils";
import { type TranslationMessage } from "@/types";

const renderInput = ({
  field,
  t,
  schemaPrefix,
}: {
  field: AddressFormField;
  schemaPrefix?: string;
  t: Awaited<ReturnType<typeof getTranslations<"address">>>;
}) => {
  const withSchemaPrefix = generateFieldPrefix(schemaPrefix);
  const localField = {
    ...field,
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
              {renderInput({ field, t, schemaPrefix })}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};
