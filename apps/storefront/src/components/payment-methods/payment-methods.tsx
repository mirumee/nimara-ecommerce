import { useFormContext } from "react-hook-form";

import {
  type PaymentMethod as TPaymentMethods,
  type PaymentMethodType,
} from "@nimara/domain/objects/Payment";
import { FormControl, FormField, FormItem } from "@nimara/ui/components/form";
import { RadioGroup } from "@nimara/ui/components/radio-group";

import { CreditCardList } from "@/components/payment-methods/credit-card-list";
import { PaypalList } from "@/components/payment-methods/paypal-list";
import { groupPaymentMethods } from "@/lib/payment";

const COMPONENTS_MAP: Record<PaymentMethodType, any> = {
  card: CreditCardList,
  paypal: PaypalList,
};

export const PaymentMethods = ({ methods }: { methods: TPaymentMethods[] }) => {
  const { control, formState } = useFormContext();
  const { isSubmitting } = formState;

  const groupedMethods = groupPaymentMethods(methods);

  return (
    <FormField
      control={control}
      name="paymentMethod"
      render={({ field }) => (
        <FormItem>
          <FormControl>
            <RadioGroup
              className="gap-6"
              onValueChange={field.onChange}
              defaultValue={field.value}
              disabled={isSubmitting}
            >
              {Object.entries(groupedMethods).map(([type, items]) => {
                if (type in COMPONENTS_MAP) {
                  const Component = COMPONENTS_MAP[type as PaymentMethodType];

                  return <Component key={type} items={items} />;
                }

                return null;
              })}
            </RadioGroup>
          </FormControl>
        </FormItem>
      )}
    />
  );
};
