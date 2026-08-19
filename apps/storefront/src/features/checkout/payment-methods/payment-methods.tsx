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
import { OtherMethodList } from "./other-method-list";
import { PaypalList } from "./paypal-list";

const COMPONENTS_MAP: Record<PaymentMethodType, any> = {
  card: CreditCardList,
  other: OtherMethodList,
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
                /**
                 * A gateway type with no dedicated list still has to be
                 * selectable, so anything unmapped renders as an other method.
                 */
                const Component =
                  COMPONENTS_MAP[type as PaymentMethodType] ?? OtherMethodList;

                return <Component key={type} items={items} />;
              })}
            </RadioGroup>
          </FormControl>
        </FormItem>
      )}
    />
  );
};
