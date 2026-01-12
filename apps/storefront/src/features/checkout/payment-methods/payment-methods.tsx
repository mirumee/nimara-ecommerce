import {
  type PaymentMethod as TPaymentMethods,
  type PaymentMethodType,
} from "@nimara/domain/objects/Payment";
import {
  FormControl,
  FormField,
  FormItem,
  useFormContext,
} from "@nimara/ui/components/form";
import { RadioGroup } from "@nimara/ui/components/radio-group";

import { groupPaymentMethods } from "@/features/checkout/payment";

import { CreditCardList } from "./credit-card-list";
import { PaypalList } from "./paypal-list";

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
